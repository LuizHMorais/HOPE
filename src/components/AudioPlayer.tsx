import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  title = "Áudio", 
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useExternal, setUseExternal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Converter URL do Google Drive para formato compatível com <audio>
  const getDirectAudioUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (fileId) {
        // URL direta para download do Google Drive
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    return url;
  };

  const directUrl = getDirectAudioUrl(audioUrl);

  // Debug logs
  console.log('🎵 AudioPlayer Debug:');
  console.log('URL original:', audioUrl);
  console.log('URL convertida:', directUrl);

  const togglePlayPause = async () => {
    if (isPlaying) {
      // Pausar reprodução
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Iniciar reprodução
      setError(null);
      setIsLoading(true);
      console.log('🎵 Tentando reproduzir áudio...');
      
      if (useExternal) {
        // Abrir em nova aba
        window.open(audioUrl, '_blank');
        setIsPlaying(true);
        setIsLoading(false);
        console.log('🎵 Áudio aberto em nova aba!');
      } else {
        // Tentar com elemento audio
        try {
          if (audioRef.current) {
            // Para arquivos locais, não precisa de load()
            await audioRef.current.play();
            setIsPlaying(true);
            setIsLoading(false);
            console.log('🎵 Áudio local iniciado com sucesso!');
          }
        } catch (error) {
          console.error('🎵 Erro ao reproduzir áudio:', error);
          // Se falhar com audio local, tentar link externo
          if (audioUrl.startsWith('/')) {
            console.log('🎵 Arquivo local falhou, tentando link externo...');
            setUseExternal(true);
            setIsLoading(false);
            setError('Arquivo local falhou. Tentando link externo.');
          } else {
            setIsLoading(false);
            setError('Erro ao reproduzir áudio. Verifique se o arquivo existe.');
          }
        }
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
          <strong>✅ Áudio Local:</strong> Usando arquivo de áudio local do TTS. Deve reproduzir diretamente no navegador.
        </div>
        
        <audio
          ref={audioRef}
          src={directUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onLoadStart={() => {
            console.log('🎵 Áudio: Carregamento iniciado');
            setIsLoading(true);
            setError(null);
          }}
          onCanPlay={() => {
            console.log('🎵 Áudio: Pode reproduzir');
            setIsLoading(false);
          }}
          onCanPlayThrough={() => {
            console.log('🎵 Áudio: Carregamento completo');
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error('🎵 Erro no áudio:', e);
            setIsLoading(false);
            setError('Erro ao carregar áudio. Verifique se o arquivo é público no Google Drive.');
          }}
          onAbort={() => {
            console.log('🎵 Áudio: Carregamento abortado');
            setIsLoading(false);
          }}
          onStalled={() => {
            console.log('🎵 Áudio: Carregamento travado');
            setIsLoading(false);
          }}
          onSuspend={() => {
            console.log('🎵 Áudio: Carregamento suspenso');
            setIsLoading(false);
          }}
          preload="none"
        />

        
        {/* Controles principais */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
            className="h-10 w-10"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={togglePlayPause}
            size="lg"
            className="h-12 w-12 rounded-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
            <strong>❌ Erro:</strong> {error}
          </div>
        )}

        {/* Botão para abrir no Google Drive */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🎵 Abrindo link original...');
              window.open(audioUrl, '_blank');
            }}
          >
            🔗 Abrir no Google Drive
          </Button>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controle de volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-500 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Informações do áudio */}
        <div className="text-xs text-gray-400 space-y-1">
          <div className="break-all">
            <strong>URL Original:</strong> {audioUrl}
          </div>
          <div className="break-all">
            <strong>URL Convertida:</strong> {directUrl}
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          <strong>Status:</strong> {isLoading ? '⏳ Carregando...' : isPlaying ? '🎵 Reproduzindo' : '⏸️ Pausado'} | 
          <strong> Modo:</strong> {useExternal ? '🔗 Link Externo' : '🎵 Audio Element'} | 
          <strong> Duração:</strong> {formatTime(duration)} | 
          <strong> Volume:</strong> {Math.round(volume * 100)}%
        </div>
      </CardContent>
    </Card>
  );
};
