const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');

class DownloadService {
  constructor() {
    this.activeDownloads = new Map();
    this.downloadQueue = [];
    this.maxConcurrent = config.max_dl;
  }

  // Verificar se o yt-dlp está instalado
  async checkYtdlpInstallation() {
    return new Promise((resolve) => {
      const check = spawn('which', [config.bin]);
      check.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  // Obter versão do yt-dlp
  async getYtdlpVersion() {
    return new Promise((resolve, reject) => {
      const version = spawn(config.bin, ['--version']);
      let output = '';
      
      version.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      version.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error('Falha ao obter versão do yt-dlp'));
        }
      });
    });
  }

  // Verificar se o ffmpeg está instalado
  async checkFfmpegInstallation() {
    return new Promise((resolve) => {
      const check = spawn('which', [config.extracter]);
      check.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  // Validar URL
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Obter informações do vídeo sem baixar
  async getVideoInfo(urls) {
    const urlsArray = Array.isArray(urls) ? urls : [urls];
    
    for (const url of urlsArray) {
      if (!this.isValidUrl(url)) {
        throw new Error(`URL inválida: ${url}`);
      }
    }

    return new Promise((resolve, reject) => {
      const args = ['-J', ...urlsArray];
      const info = spawn(config.bin, args);
      let output = '';
      
      info.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      info.stderr.on('data', (data) => {
        console.error(`yt-dlp stderr: ${data}`);
      });
      
      info.on('close', (code) => {
        if (code === 0 && output) {
          try {
            const jsonOutput = JSON.parse(output);
            resolve(jsonOutput);
          } catch (e) {
            reject(new Error('Falha ao processar informações do vídeo'));
          }
        } else {
          reject(new Error('Falha ao obter informações do vídeo'));
        }
      });
    });
  }

  // Iniciar download
  async startDownload(urls, options = {}) {
    const {
      audioOnly = false,
      outfilename = config.outfilename,
      vformat = false,
      downloadPath = config.outputFolder,
      onProgress = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options;

    const urlsArray = Array.isArray(urls) ? urls : [urls];
    
    // Validar URLs
    for (const url of urlsArray) {
      if (!this.isValidUrl(url)) {
        throw new Error(`URL inválida: ${url}`);
      }
    }

    // Verificar limite de downloads simultâneos
    if (this.activeDownloads.size >= this.maxConcurrent) {
      throw new Error('Limite de downloads simultâneos atingido!');
    }

    // Verificar se as pastas existem
    await this.ensureDirectories(downloadPath);

    const downloadId = Date.now().toString();
    const logFile = path.join(config.logFolder, `${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);

    const args = [
      '--ignore-errors',
      '-o', path.join(downloadPath, outfilename),
      '--restrict-filenames'
    ];

    if (vformat) {
      args.push('--format', vformat);
    }

    if (audioOnly) {
      args.push('-x', '--audio-format', config.audio_format, '--audio-quality', config.audio_quality);
    }

    args.push(...urlsArray);

    const downloadProcess = spawn(config.bin, args);
    
    // Configurar logging se habilitado
    if (config.log) {
      const logStream = fs.createWriteStream(logFile);
      downloadProcess.stdout.pipe(logStream);
      downloadProcess.stderr.pipe(logStream);
    }

    // Monitorar progresso
    let progress = 0;
    downloadProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Extrair progresso do output do yt-dlp
      const progressMatch = output.match(/(\d+\.?\d*)%/);
      if (progressMatch) {
        progress = parseFloat(progressMatch[1]);
        onProgress(progress, output);
      }
    });

    // Monitorar erros
    downloadProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`Download error: ${error}`);
      onError(error);
    });

    // Monitorar conclusão
    downloadProcess.on('close', (code) => {
      this.activeDownloads.delete(downloadId);
      
      if (code === 0) {
        onComplete('Download concluído com sucesso!');
      } else {
        onError(`Download falhou com código de saída: ${code}`);
      }
      
      // Processar próxima fila se houver
      this.processQueue();
    });

    // Armazenar download ativo
    this.activeDownloads.set(downloadId, {
      process: downloadProcess,
      urls: urlsArray,
      startTime: new Date(),
      logFile
    });

    return downloadId;
  }

  // Parar todos os downloads
  async stopAllDownloads() {
    const promises = [];
    
    for (const [id, download] of this.activeDownloads) {
      promises.push(this.stopDownload(id));
    }
    
    await Promise.all(promises);
    return 'Todos os downloads foram parados.';
  }

  // Parar download específico
  async stopDownload(downloadId) {
    const download = this.activeDownloads.get(downloadId);
    if (!download) {
      throw new Error('Download não encontrado');
    }

    download.process.kill('SIGTERM');
    this.activeDownloads.delete(downloadId);
    
    return 'Download parado com sucesso.';
  }

  // Obter downloads ativos
  getActiveDownloads() {
    const downloads = [];
    
    for (const [id, download] of this.activeDownloads) {
      downloads.push({
        id,
        urls: download.urls,
        startTime: download.startTime,
        logFile: download.logFile
      });
    }
    
    return downloads;
  }

  // Obter número de downloads ativos
  getActiveDownloadsCount() {
    return this.activeDownloads.size;
  }

  // Garantir que os diretórios existam
  async ensureDirectories(downloadPath = null) {
    const targetPath = downloadPath || config.outputFolder;
    await fs.ensureDir(targetPath);
    if (config.log) {
      await fs.ensureDir(config.logFolder);
    }
  }

  // Processar fila de downloads
  processQueue() {
    if (this.downloadQueue.length > 0 && this.activeDownloads.size < this.maxConcurrent) {
      const nextDownload = this.downloadQueue.shift();
      this.startDownload(nextDownload.urls, nextDownload.options);
    }
  }

  // Adicionar à fila de downloads
  addToQueue(urls, options) {
    this.downloadQueue.push({ urls, options });
  }
}

module.exports = new DownloadService();
