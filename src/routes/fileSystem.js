const express = require('express');
const { body, validationResult } = require('express-validator');
const fileSystemService = require('../services/fileSystemService');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Página principal do navegador de arquivos
router.get('/', isAuthenticated, (req, res) => {
  res.render('fileSystem/index', {
    title: 'Navegador de Arquivos',
    user: req.session.user
  });
});

// Listar discos disponíveis
router.get('/disks', isAuthenticated, async (req, res) => {
  try {
    const disks = await fileSystemService.getAvailableDisks();
    res.json({
      success: true,
      disks: disks
    });
  } catch (error) {
    console.error('Erro ao obter discos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Navegar em uma pasta
router.get('/navigate', isAuthenticated, async (req, res) => {
  try {
    const { path: dirPath, showHidden = false } = req.query;
    
    if (!dirPath) {
      return res.status(400).json({
        success: false,
        error: 'Caminho não especificado'
      });
    }

    const navigation = await fileSystemService.navigateDirectory(dirPath, showHidden === 'true');
    res.json({
      success: true,
      navigation: navigation
    });
  } catch (error) {
    console.error('Erro ao navegar na pasta:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Criar nova pasta
router.post('/create-folder', isAuthenticated, [
  body('parentPath').notEmpty().withMessage('Caminho pai é obrigatório'),
  body('folderName').notEmpty().withMessage('Nome da pasta é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { parentPath, folderName } = req.body;
    const result = await fileSystemService.createDirectory(parentPath, folderName);
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



// Renomear item
router.put('/rename', isAuthenticated, [
  body('oldPath').notEmpty().withMessage('Caminho antigo é obrigatório'),
  body('newName').notEmpty().withMessage('Novo nome é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { oldPath, newName } = req.body;
    const result = await fileSystemService.renameItem(oldPath, newName);
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Erro ao renomear item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verificar permissões
router.get('/permissions', isAuthenticated, async (req, res) => {
  try {
    const { path: dirPath } = req.query;
    
    if (!dirPath) {
      return res.status(400).json({
        success: false,
        error: 'Caminho não especificado'
      });
    }

    const permissions = await fileSystemService.checkPermissions(dirPath);
    res.json({
      success: true,
      permissions: permissions
    });
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obter informações do sistema
router.get('/system-info', isAuthenticated, async (req, res) => {
  try {
    const systemInfo = await fileSystemService.getSystemInfo();
    res.json({
      success: true,
      systemInfo: systemInfo
    });
  } catch (error) {
    console.error('Erro ao obter informações do sistema:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Buscar arquivos/pastas
router.get('/search', isAuthenticated, async (req, res) => {
  try {
    const { path: searchPath, query, recursive = false } = req.query;
    
    if (!searchPath || !query) {
      return res.status(400).json({
        success: false,
        error: 'Caminho e query são obrigatórios'
      });
    }

    const results = await fileSystemService.searchItems(searchPath, query, recursive === 'true');
    res.json({
      success: true,
      results: results,
      query: query,
      searchPath: searchPath
    });
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obter tamanho de pasta
router.get('/size', isAuthenticated, async (req, res) => {
  try {
    const { path: dirPath } = req.query;
    
    if (!dirPath) {
      return res.status(400).json({
        success: false,
        error: 'Caminho não especificado'
      });
    }

    const size = await fileSystemService.getDirectorySize(dirPath);
    const freeSpace = await fileSystemService.getFreeSpace(dirPath);
    
    res.json({
      success: true,
      size: size,
      sizeFormatted: fileSystemService.formatBytes(size),
      freeSpace: freeSpace,
      freeSpaceFormatted: fileSystemService.formatBytes(freeSpace)
    });
  } catch (error) {
    console.error('Erro ao obter tamanho:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload de arquivo (para futuras implementações)
router.post('/upload', isAuthenticated, async (req, res) => {
  try {
    // TODO: Implementar upload de arquivos
    res.json({
      success: false,
      error: 'Upload ainda não implementado'
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Download de arquivo
router.get('/download', isAuthenticated, async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'Caminho do arquivo não especificado'
      });
    }

    const fs = require('fs-extra');
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível baixar uma pasta'
      });
    }

    // Configurar headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);

    // Stream do arquivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
