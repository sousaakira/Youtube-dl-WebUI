const express = require('express');
const fileService = require('../services/fileService');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar arquivos
router.get('/', async (req, res) => {
  try {
    const [files, parts] = await Promise.all([
      fileService.listFiles(),
      fileService.listParts()
    ]);

    res.render('files/index', {
      title: 'Lista de Arquivos',
      files,
      parts
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    req.flash('error_msg', 'Erro ao carregar lista de arquivos');
    res.render('files/index', {
      title: 'Lista de Arquivos',
      files: [],
      parts: []
    });
  }
});

// Deletar arquivo
router.delete('/:filename', isAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const success = await fileService.deleteFile(filename);
    
    if (success) {
      req.flash('success_msg', 'Arquivo deletado com sucesso!');
    } else {
      req.flash('error_msg', 'Erro ao deletar arquivo');
    }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    req.flash('error_msg', 'Erro interno do servidor');
  }
  
  res.redirect('/files');
});

// Baixar arquivo
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = fileService.getDownloadsFolder();
    const fullPath = require('path').join(filePath, filename);
    
    // Verificar se o arquivo existe
    const fs = require('fs-extra');
    const exists = await fs.pathExists(fullPath);
    
    if (!exists) {
      req.flash('error_msg', 'Arquivo não encontrado');
      return res.redirect('/files');
    }
    
    // Configurar headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream do arquivo
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    req.flash('error_msg', 'Erro ao baixar arquivo');
    res.redirect('/files');
  }
});

// Visualizar arquivo (stream)
router.get('/stream/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = fileService.getDownloadsFolder();
    const fullPath = require('path').join(filePath, filename);
    
    // Verificar se o arquivo existe
    const fs = require('fs-extra');
    const exists = await fs.pathExists(fullPath);
    
    if (!exists) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Obter estatísticas do arquivo
    const stats = await fs.stat(fullPath);
    
    // Verificar se é um arquivo de mídia
    const mediaExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.mp3', '.wav', '.flac', '.aac'];
    const ext = require('path').extname(filename).toLowerCase();
    
    if (!mediaExtensions.includes(ext)) {
      return res.status(400).json({ error: 'Tipo de arquivo não suportado para streaming' });
    }
    
    // Configurar headers para streaming
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': getContentType(ext)
      });
      
      const stream = fs.createReadStream(fullPath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': getContentType(ext)
      });
      
      const stream = fs.createReadStream(fullPath);
      stream.pipe(res);
    }
    
  } catch (error) {
    console.error('Erro ao fazer streaming do arquivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter informações do arquivo
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const integrity = await fileService.checkFileIntegrity(filename);
    
    res.json({
      success: true,
      filename,
      integrity
    });
  } catch (error) {
    console.error('Erro ao obter informações do arquivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await fileService.listLogs();
    const logCount = await fileService.countLogs();
    
    res.render('files/logs', {
      title: 'Logs do Sistema',
      logs,
      logCount
    });
  } catch (error) {
    console.error('Erro ao listar logs:', error);
    req.flash('error_msg', 'Erro ao carregar logs');
    res.render('files/logs', {
      title: 'Logs do Sistema',
      logs: [],
      logCount: 0
    });
  }
});

// Visualizar log específico
router.get('/logs/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const content = await fileService.getLogContent(filename);
    
    if (content === null) {
      req.flash('error_msg', 'Log não encontrado');
      return res.redirect('/files/logs');
    }
    
    res.render('files/log-view', {
      title: `Log: ${filename}`,
      filename,
      content
    });
  } catch (error) {
    console.error('Erro ao visualizar log:', error);
    req.flash('error_msg', 'Erro ao carregar log');
    res.redirect('/files/logs');
  }
});

// Deletar log
router.delete('/logs/:filename', isAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const logPath = require('path').join(fileService.getLogsFolder(), filename);
    
    await require('fs-extra').remove(logPath);
    req.flash('success_msg', 'Log deletado com sucesso!');
  } catch (error) {
    console.error('Erro ao deletar log:', error);
    req.flash('error_msg', 'Erro ao deletar log');
  }
  
  res.redirect('/files/logs');
});

// Função auxiliar para determinar o tipo de conteúdo
function getContentType(extension) {
  const contentTypes = {
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac'
  };
  
  return contentTypes[extension] || 'application/octet-stream';
}

module.exports = router;
