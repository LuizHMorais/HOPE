# server.py
from __future__ import annotations

import hashlib
import json
import os
import subprocess
import tempfile
import time
import wave
from pathlib import Path
from typing import Dict, List, Tuple

from flask import Flask, Response, jsonify, request

app = Flask(__name__)

# Diretórios e paths (podem ser sobrescritos por envs no docker-compose)
VOICES_DIR = Path(os.getenv("VOICES_DIR", "/app/voices"))
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "/app/output"))
PIPER_BIN = Path(os.getenv("PIPER_BIN", "/usr/local/bin/piper"))

# Formatos de saída suportados
ALLOWED_FORMATS = frozenset({"wav", "mp3"})

# Voz default (se existir no diretório)
DEFAULT_VOICE_ID = os.getenv("DEFAULT_VOICE", "pt_BR-edresson-low")


# ---------- utilidades ----------

def _list_voices() -> List[Dict]:
    """Varre VOICES_DIR por <id>.onnx e <id>.onnx.json e monta lista."""
    voices: List[Dict] = []
    if not VOICES_DIR.exists():
        return voices

    for onnx in VOICES_DIR.glob("*.onnx"):
        vid = onnx.stem
        cfg = VOICES_DIR / f"{vid}.onnx.json"
        if not cfg.exists():
            # exige .json ao lado do .onnx
            continue

        meta = {"id": vid, "model_path": str(onnx), "config_path": str(cfg)}
        # tenta extrair alguns campos do json (não obrigatório)
        try:
            with cfg.open("r", encoding="utf-8") as f:
                j = json.load(f)
            meta["sample_rate"] = j.get("sample_rate_hz")
            meta["language"] = j.get("language", j.get("locale"))
        except Exception:
            pass

        voices.append(meta)

    return sorted(voices, key=lambda v: v["id"])


def _voice_paths(voice_id: str) -> Tuple[Path, Path]:
    """Resolve caminhos do modelo/config para um voice_id."""
    model = VOICES_DIR / f"{voice_id}.onnx"
    cfg = VOICES_DIR / f"{voice_id}.onnx.json"
    return model, cfg


def _ensure_dirs() -> None:
    VOICES_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def _wav_duration_seconds(wav_path: Path) -> float:
    with wave.open(str(wav_path), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        return round(frames / float(rate), 3)


def _sanitize_filename(s: str) -> str:
    return "".join(ch for ch in s if ch.isalnum() or ch in "-_.").strip()


# ---------- rotas ----------

@app.get("/health")
def health():
    ok = PIPER_BIN.exists() and os.access(PIPER_BIN, os.X_OK)
    payload = {
        "status": "ok" if ok else "error",
        "piper_bin": str(PIPER_BIN),
        "voices_dir": str(VOICES_DIR),
        "output_dir": str(OUTPUT_DIR),
    }
    code = 200 if ok else 500
    return jsonify(payload), code


# Alias solicitado
@app.get("/healthz")
def healthz():
    return health()


@app.get("/voices")
def voices():
    return jsonify({"voices": _list_voices()})


@app.post("/tts")
def tts():
    """
    Body JSON:
    {
      "text": "string",                  (obrigatório)
      "voice": "pt_BR-edresson-low",     (opcional; default = DEFAULT_VOICE_ID)
      "format": "wav" | "mp3",           (opcional; default = "wav")
      "save": true|false                 (opcional; default = false)
    }
    Retorna bytes de áudio com Content-Type apropriado.
    """
    _ensure_dirs()

    # valida JSON
    try:
        data = request.get_json(force=True, silent=False)  # lança se inválido
    except Exception:
        return jsonify({"error": "JSON inválido"}), 400

    text = (data or {}).get("text")
    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Campo 'text' é obrigatório"}), 400

    voice = (data or {}).get("voice") or DEFAULT_VOICE_ID
    fmt = ((data or {}).get("format") or "wav").lower()
    save_file = bool((data or {}).get("save", False))

    if fmt not in ALLOWED_FORMATS:
        return jsonify({"error": f"Formato não suportado. Use um de {sorted(ALLOWED_FORMATS)}"}), 400

    # resolve paths do modelo
    model_path, cfg_path = _voice_paths(voice)
    if not model_path.exists() or not cfg_path.exists():
        return jsonify({
            "error": "Voz não encontrada",
            "voice": voice,
            "hint": f"Coloque {voice}.onnx e {voice}.onnx.json em {VOICES_DIR}"
        }), 404

    if not PIPER_BIN.exists() or not os.access(PIPER_BIN, os.X_OK):
        return jsonify({"error": "Binário do piper não encontrado ou sem permissão de execução",
                        "piper_bin": str(PIPER_BIN)}), 500

    # nomes temporários
    ts = int(time.time())
    base = f"{_sanitize_filename(voice)}-{hashlib.sha256(text.encode('utf-8')).hexdigest()[:12]}-{ts}"
    out_wav = OUTPUT_DIR / f"{base}.wav"

    # roda o piper (texto via stdin)
    try:
        proc = subprocess.run(
            [
                str(PIPER_BIN),
                "--model", str(model_path),
                "--config", str(cfg_path),
                "--output_file", str(out_wav),
                "--sentence_silence", "0.2",
                # parâmetros padrão razoáveis
                "--length_scale", "1.0",
                "--noise_scale", "0.667",
                "--noise_w", "0.8",
            ],
            input=text.encode("utf-8"),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": "Falha ao sintetizar com Piper",
            "stderr": e.stderr.decode("utf-8", "ignore"),
        }), 500

    if not out_wav.exists():
        return jsonify({"error": "Piper não gerou arquivo WAV"}), 500

    # duração
    seconds = _wav_duration_seconds(out_wav)

    # conversão opcional para MP3
    mimetype = "audio/wav"
    filename = "speech.wav"
    audio_bytes = out_wav.read_bytes()
    final_path = out_wav

    if fmt == "mp3":
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmpmp3:
            tmpmp3_path = Path(tmpmp3.name)
        try:
            conv = subprocess.run(
                ["ffmpeg", "-y", "-i", str(out_wav), "-f", "mp3", str(tmpmp3_path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )
            audio_bytes = tmpmp3_path.read_bytes()
            mimetype = "audio/mpeg"
            filename = "speech.mp3"
            final_path = tmpmp3_path
        except subprocess.CalledProcessError as e:
            return jsonify({
                "error": "Falha ao converter para MP3 (ffmpeg)",
                "stderr": e.stderr.decode("utf-8", "ignore"),
            }), 500
        finally:
            # mantém apenas se save=True
            if not save_file:
                tmpmp3_path.unlink(missing_ok=True)

    # se não quiser salvar, removemos o wav intermediário
    if not save_file:
        out_wav.unlink(missing_ok=True)
    else:
        # se o formato final for mp3, renomeie mp3 para /app/output/<base>.mp3
        if fmt == "mp3" and final_path.exists():
            target = OUTPUT_DIR / f"{base}.mp3"
            try:
                final_path.replace(target)
                final_path = target
            except Exception:
                pass

    headers = {
        "Content-Disposition": f'inline; filename="{filename}"',
        "X-Audio-Seconds": str(seconds),
        "X-Voice-Id": voice,
    }
    return Response(audio_bytes, mimetype=mimetype, headers=headers)


if __name__ == "__main__":
    # Porta padrão 8800 (ajuste com env PORT se quiser)
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8800")))
