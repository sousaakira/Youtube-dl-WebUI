const dotenv = require('dotenv');
dotenv.config();
const path = require('path');

module.exports = {
  // Binário do yt-dlp ou youtube-dl
  bin: process.env.YTDLP_BIN || '/usr/bin/yt-dlp',
  
  // Configurações de segurança
  security: process.env.SECURITY_ENABLED === 'true' || false,
  password: process.env.ADMIN_PASSWORD || '63a9f0ea7bb98050796b649e85481845', // md5 hash de "root"
  
  // Pastas de saída
  outputFolder: process.env.OUTPUT_FOLDER || path.join(__dirname, '../../downloads'),
  logFolder: process.env.LOG_FOLDER || path.join(__dirname, '../../logs'),
  
  // Configurações de download
  extracter: process.env.EXTRACTER || 'ffmpeg',
  outfilename: process.env.OUTFILENAME || '%(title)s-%(id)s.%(ext)s',
  max_dl: parseInt(process.env.MAX_DOWNLOADS) || 3,
  
  // Configurações de sessão
  session_lifetime: parseInt(process.env.SESSION_LIFETIME) || 86400,
  
  // Configurações de log
  log: process.env.LOG_ENABLED === 'true' || true,
  
  // Configurações do servidor
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  
  // Configurações de ambiente
  node_env: process.env.NODE_ENV || 'development',
  
  // Configurações de segurança adicional
  session_secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  
  // Timeout para downloads (em segundos)
  download_timeout: parseInt(process.env.DOWNLOAD_TIMEOUT) || 3600,
  
  // Configurações de formato de vídeo padrão
  default_video_format: process.env.DEFAULT_VIDEO_FORMAT || 'best',
  
  // Configurações de áudio
  audio_format: process.env.AUDIO_FORMAT || 'mp3',
  audio_quality: process.env.AUDIO_QUALITY || '192'
};
