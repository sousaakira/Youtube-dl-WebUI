const express = require('express');
const { body, validationResult } = require('express-validator');
const downloadService = require('../services/downloadService');
const fileService = require('../services/fileService');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

// Página principal de download
router.get('/', async (req, res) => {
  try {
    const [freeSpace, usedSpace, ytdlpVersion] = await Promise.all([
      fileService.getFreeSpace(),
      fileService.getUsedSpace(),
      downloadService.getYtdlpVersion()
    ]);

    res.render('download/index', {
      title: 'Download',
      freeSpace,
      usedSpace,
      ytdlpVersion,
      downloadsFolder: fileService.getDownloadsFolder()
    });
  } catch (error) {
    console.error('Erro ao carregar página de download:', error);
    req.flash('error_msg', 'Erro ao carregar informações do sistema');
    res.render('download/index', {
      title: 'Download',
      freeSpace: 'N/A',
      usedSpace: 'N/A',
      ytdlpVersion: 'N/A',
      downloadsFolder: 'N/A'
    });
  }
});

// Processar download
router.post('/', [
  body('urls').notEmpty().withMessage('URLs são obrigatórias'),
  body('outfilename').optional(),
  body('vformat').optional(),
  body('downloadPath').optional()
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    req.flash('error_msg', errors.array()[0].msg);
    return res.redirect('/download');
  }

  const { urls, audio, outfilename, vformat, downloadPath } = req.body;
  const audioOnly = !!audio;
  
  try {
    // Verificar se o yt-dlp está instalado
    const isYtdlpInstalled = await downloadService.checkYtdlpInstallation();
    if (!isYtdlpInstalled) {
      req.flash('error_msg', 'yt-dlp não está instalado ou não foi encontrado no sistema');
      return res.redirect('/download');
    }

    // Verificar se o ffmpeg está instalado para extração de áudio
    if (audioOnly) {
      const isFfmpegInstalled = await downloadService.checkFfmpegInstallation();
      if (!isFfmpegInstalled) {
        req.flash('error_msg', 'ffmpeg não está instalado. É necessário para extração de áudio.');
        return res.redirect('/download');
      }
    }

    // Verificar limite de downloads simultâneos
    const activeDownloads = downloadService.getActiveDownloadsCount();
    if (activeDownloads >= 3) { // config.max_dl
      req.flash('warning_msg', 'Limite de downloads simultâneos atingido. O download será adicionado à fila.');
    }

    // Iniciar download
    const downloadId = await downloadService.startDownload(urls, {
      audioOnly,
      outfilename: outfilename || undefined,
      vformat: vformat || undefined,
      downloadPath: downloadPath || undefined,
      onProgress: (progress, output) => {
        console.log(`Download ${downloadId}: ${progress}%`);
      },
      onComplete: (message) => {
        console.log(`Download ${downloadId} concluído: ${message}`);
      },
      onError: (error) => {
        console.error(`Download ${downloadId} erro: ${error}`);
      }
    });

    req.flash('success_msg', 'Download iniciado com sucesso!');
    res.redirect('/download');
    
  } catch (error) {
    console.error('Erro ao iniciar download:', error);
    req.flash('error_msg', `Erro ao iniciar download: ${error.message}`);
    res.redirect('/download');
  }
});

// Obter informações do vídeo
router.post('/info', [
  body('urls').notEmpty().withMessage('URLs são obrigatórias')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { urls } = req.body;
  
  try {
    const info = await downloadService.getVideoInfo(urls);
    res.json({ success: true, info });
  } catch (error) {
    console.error('Erro ao obter informações do vídeo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parar todos os downloads (apenas admin)
router.post('/stop-all', isAdmin, async (req, res) => {
  try {
    const message = await downloadService.stopAllDownloads();
    req.flash('success_msg', message);
  } catch (error) {
    console.error('Erro ao parar downloads:', error);
    req.flash('error_msg', 'Erro ao parar downloads');
  }
  
  res.redirect('/download');
});

// Parar download específico (apenas admin)
router.post('/stop/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const message = await downloadService.stopDownload(id);
    req.flash('success_msg', message);
  } catch (error) {
    console.error('Erro ao parar download:', error);
    req.flash('error_msg', 'Erro ao parar download');
  }
  
  res.redirect('/download');
});

// Obter status dos downloads ativos
router.get('/status', async (req, res) => {
  try {
    const activeDownloads = downloadService.getActiveDownloads();
    const activeCount = downloadService.getActiveDownloadsCount();
    
    res.json({
      success: true,
      activeDownloads,
      activeCount,
      maxConcurrent: 3 // config.max_dl
    });
  } catch (error) {
    console.error('Erro ao obter status dos downloads:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verificar instalações
router.get('/check-installations', async (req, res) => {
  try {
    const [ytdlpInstalled, ffmpegInstalled, ytdlpVersion] = await Promise.all([
      downloadService.checkYtdlpInstallation(),
      downloadService.checkFfmpegInstallation(),
      downloadService.getYtdlpVersion()
    ]);

    res.json({
      success: true,
      ytdlpInstalled,
      ffmpegInstalled,
      ytdlpVersion
    });
  } catch (error) {
    console.error('Erro ao verificar instalações:', error);
    res.status(500).json({ error: error.message });
  }
});

// Limpar arquivos antigos (apenas admin)
router.post('/cleanup', isAdmin, async (req, res) => {
  try {
    const { maxAge } = req.body;
    const ageInDays = parseInt(maxAge) || 7;
    const ageInMs = ageInDays * 24 * 60 * 60 * 1000;
    
    const deletedFiles = await fileService.cleanupOldFiles(ageInMs);
    const deletedLogs = await fileService.cleanupOldLogs();
    
    req.flash('success_msg', `Limpeza concluída: ${deletedFiles} arquivos e ${deletedLogs} logs removidos`);
  } catch (error) {
    console.error('Erro na limpeza:', error);
    req.flash('error_msg', 'Erro durante a limpeza');
  }
  
  res.redirect('/download');
});

module.exports = router;
