# Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# SO deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl xz-utils ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baixar Piper (binário + libs) p/ /usr/local/bin/piper (DIRETÓRIO)
# Ajuste a versão/URL se quiser outra release
RUN set -eux; \
    mkdir -p /usr/local/bin/piper; \
    url1="https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz"; \
    url2="https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_amd64.tar.gz"; \
    curl -fL "$url1" -o /tmp/piper.tar.gz || curl -fL "$url2" -o /tmp/piper.tar.gz; \
    tar -xzf /tmp/piper.tar.gz -C /usr/local/bin/piper --strip-components=1; \
    rm -f /tmp/piper.tar.gz; \
    chmod +x /usr/local/bin/piper/piper

# Copia o app
COPY server.py .

# Pastas de trabalho (montadas por volume no compose)
RUN mkdir -p /app/output /app/voices

# Porta
EXPOSE 8800

# Env padrão (ajustáveis no compose)
ENV VOICES_DIR=/app/voices \
    OUTPUT_DIR=/app/output \
    DEFAULT_VOICE=pt_BR-edresson-low \
    PIPER_BIN=/usr/local/bin/piper/piper

# Inicia o Flask dev server
CMD ["python", "server.py"]
