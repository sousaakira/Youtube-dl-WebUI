const fs = require('fs-extra');
const path = require('path');
const config = require('../config/config');

class FileService {
  constructor() {
    this.rePartial = /(?:\.part(?:-Frag\d+)?|\.ytdl)$/m;
  }

  // Verificar se a pasta de downloads existe
  async outputFolderExists() {
    try {
      const stats = await fs.stat(config.outputFolder);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  // Verificar se a pasta de logs existe
  async logsFolderExists() {
    try {
      const stats = await fs.stat(config.logFolder);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  // Obter pasta de downloads
  getDownloadsFolder() {
    return config.outputFolder;
  }

  // Obter pasta de logs
  getLogsFolder() {
    return config.logFolder;
  }

  // Obter pasta de downloads relativa
  getRelativeDownloadsFolder() {
    return 'downloads';
  }

  // Listar arquivos completos
  async listFiles() {
    if (!(await this.outputFolderExists())) {
      return [];
    }

    try {
      const files = await fs.readdir(config.outputFolder);
      const fileList = [];

      for (const file of files) {
        const filePath = path.join(config.outputFolder, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile() && !this.rePartial.test(file)) {
          fileList.push({
            name: file,
            size: this.toHumanFileSize(stats.size),
            sizeBytes: stats.size,
            modified: stats.mtime,
            path: filePath
          });
        }
      }

      return fileList.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }

  // Listar arquivos parciais
  async listParts() {
    if (!(await this.outputFolderExists())) {
      return [];
    }

    try {
      const files = await fs.readdir(config.outputFolder);
      const fileList = [];

      for (const file of files) {
        const filePath = path.join(config.outputFolder, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile() && this.rePartial.test(file)) {
          fileList.push({
            name: file,
            size: this.toHumanFileSize(stats.size),
            sizeBytes: stats.size,
            modified: stats.mtime,
            path: filePath
          });
        }
      }

      return fileList.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error('Erro ao listar arquivos parciais:', error);
      return [];
    }
  }

  // Deletar arquivo
  async deleteFile(filename) {
    try {
      const filePath = path.join(config.outputFolder, filename);
      await fs.remove(filePath);
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      return false;
    }
  }

  // Verificar se o log está habilitado
  isLogEnabled() {
    return config.log;
  }

  // Contar logs
  async countLogs() {
    if (!config.log || !(await this.logsFolderExists())) {
      return 0;
    }

    try {
      const files = await fs.readdir(config.logFolder);
      const logFiles = files.filter(file => file.endsWith('.txt'));
      return logFiles.length;
    } catch (error) {
      console.error('Erro ao contar logs:', error);
      return 0;
    }
  }

  // Listar logs
  async listLogs() {
    if (!config.log || !(await this.logsFolderExists())) {
      return [];
    }

    try {
      const files = await fs.readdir(config.logFolder);
      const logFiles = files.filter(file => file.endsWith('.txt'));
      const logList = [];

      for (const file of logFiles) {
        const filePath = path.join(config.logFolder, file);
        const stats = await fs.stat(filePath);

        try {
          const content = await fs.readFile(filePath, 'utf8');
          const lines = content.split('\n');
          const lastLine = lines[lines.length - 1] || '';
          const isComplete = lastLine.includes('100% of') || lastLine.includes('Download completed');

          logList.push({
            name: file,
            size: this.toHumanFileSize(stats.size),
            sizeBytes: stats.size,
            modified: stats.mtime,
            lastLine: lastLine,
            isComplete: isComplete,
            path: filePath
          });
        } catch (readError) {
          console.error(`Erro ao ler log ${file}:`, readError);
        }
      }

      return logList.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error('Erro ao listar logs:', error);
      return [];
    }
  }

  // Obter conteúdo do log
  async getLogContent(filename) {
    try {
      const filePath = path.join(config.logFolder, filename);
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Erro ao ler log:', error);
      return null;
    }
  }

  // Obter espaço livre em disco
  async getFreeSpace() {
    try {
      const stats = await fs.statfs(config.outputFolder);
      const freeBytes = stats.bavail * stats.bsize;
      return this.toHumanFileSize(freeBytes);
    } catch (error) {
      console.error('Erro ao obter espaço livre:', error);
      return 'N/A';
    }
  }

  // Obter espaço usado em disco
  async getUsedSpace() {
    try {
      const stats = await fs.statfs(config.outputFolder);
      const totalBytes = stats.blocks * stats.bsize;
      const freeBytes = stats.bavail * stats.bsize;
      const usedBytes = totalBytes - freeBytes;
      return this.toHumanFileSize(usedBytes);
    } catch (error) {
      console.error('Erro ao obter espaço usado:', error);
      return 'N/A';
    }
  }

  // Obter espaço total em disco
  async getTotalSpace() {
    try {
      const stats = await fs.statfs(config.outputFolder);
      const totalBytes = stats.blocks * stats.bsize;
      return this.toHumanFileSize(totalBytes);
    } catch (error) {
      console.error('Erro ao obter espaço total:', error);
      return 'N/A';
    }
  }

  // Converter bytes para formato legível
  toHumanFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Limpar arquivos antigos
  async cleanupOldFiles(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 dias por padrão
    try {
      const files = await this.listFiles();
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        if (now - file.modified.getTime() > maxAge) {
          await this.deleteFile(file.name);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Erro ao limpar arquivos antigos:', error);
      return 0;
    }
  }

  // Limpar logs antigos
  async cleanupOldLogs(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 dias por padrão
    try {
      const logs = await this.listLogs();
      const now = Date.now();
      let deletedCount = 0;

      for (const log of logs) {
        if (now - log.modified.getTime() > maxAge) {
          await fs.remove(log.path);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      return 0;
    }
  }

  // Verificar integridade dos arquivos
  async checkFileIntegrity(filename) {
    try {
      const filePath = path.join(config.outputFolder, filename);
      const stats = await fs.stat(filePath);
      
      // Verificar se o arquivo tem tamanho > 0
      if (stats.size === 0) {
        return { valid: false, reason: 'Arquivo vazio' };
      }

      // Verificar se o arquivo pode ser lido
      await fs.access(filePath, fs.constants.R_OK);
      
      return { valid: true, size: stats.size };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }
}

module.exports = new FileService();
