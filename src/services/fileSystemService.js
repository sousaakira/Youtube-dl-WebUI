const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class FileSystemService {
  constructor() {
    this.rootPaths = ['/mnt', '/media'];
    this.currentPath = process.cwd();
  }

  // Obter discos e pontos de montagem
  async getAvailableDisks() {
    const disks = [];
    
    try {
      console.log('Iniciando busca por discos disponíveis...');
      
      // Verificar /mnt - apenas diretórios específicos
      if (await fs.pathExists('/mnt')) {
        console.log('Verificando /mnt...');
        const mntContents = await fs.readdir('/mnt');
        console.log('Conteúdo de /mnt:', mntContents);
        
        // Lista de diretórios permitidos em /mnt
        const allowedMntDirs = ['sda1', 'pendrive', 'nfs', 'img', 'n8n'];
        
        for (const item of mntContents) {
          try {
            // Só processar diretórios permitidos
            if (!allowedMntDirs.includes(item)) {
              console.log('Pulando diretório não permitido /mnt:', item);
              continue;
            }
            
            const fullPath = path.join('/mnt', item);
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
              console.log('Adicionando disco /mnt:', item);
              disks.push({
                name: item,
                path: fullPath,
                type: 'mnt',
                size: await this.getDirectorySize(fullPath),
                freeSpace: await this.getFreeSpace(fullPath),
                mounted: true
              });
            }
          } catch (itemError) {
            console.log('Erro ao processar item /mnt:', item, itemError.message);
            continue;
          }
        }
      } else {
        console.log('/mnt não existe');
      }

      // Verificar /media - apenas diretórios de usuário
      if (await fs.pathExists('/media')) {
        console.log('Verificando /media...');
        const mediaContents = await fs.readdir('/media');
        console.log('Conteúdo de /media:', mediaContents);
        
        // Lista de diretórios permitidos em /media (apenas usuários)
        const allowedMediaDirs = ['akira', 'root'];
        
        for (const item of mediaContents) {
          try {
            // Só processar diretórios de usuário permitidos
            if (!allowedMediaDirs.includes(item)) {
              console.log('Pulando diretório não permitido /media:', item);
              continue;
            }
            
            const fullPath = path.join('/media', item);
            const stats = await fs.stat(fullPath);
            if (stats.isDirectory()) {
              console.log('Adicionando disco /media:', item);
              disks.push({
                name: item,
                path: fullPath,
                type: 'media',
                size: await this.getDirectorySize(fullPath),
                freeSpace: await this.getFreeSpace(fullPath),
                mounted: true
              });
            }
          } catch (itemError) {
            console.log('Erro ao processar item /media:', item, itemError.message);
            continue;
          }
        }
      } else {
        console.log('/media não existe');
      }

      console.log('Total de discos encontrados:', disks.length);
      console.log('Discos:', disks.map(d => ({ name: d.name, path: d.path, type: d.type })));

    } catch (error) {
      console.error('Erro ao obter discos:', error);
    }

    return disks;
  }

  // Navegar em uma pasta específica
  async navigateDirectory(dirPath, showHidden = false) {
    try {
      if (!await fs.pathExists(dirPath)) {
        throw new Error('Pasta não encontrada');
      }

      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error('Caminho não é uma pasta');
      }

      // Verificar se o caminho está dentro dos diretórios permitidos
      if (!this.isPathAllowed(dirPath)) {
        throw new Error('Acesso negado: caminho não permitido');
      }

      const contents = await fs.readdir(dirPath);
      const items = [];

      for (const item of contents) {
        // Pular arquivos ocultos se não solicitado
        if (!showHidden && item.startsWith('.')) {
          continue;
        }

        const fullPath = path.join(dirPath, item);
        
        // Verificar se o item está dentro dos diretórios permitidos
        if (!this.isPathAllowed(fullPath)) {
          continue;
        }

        try {
          const itemStats = await fs.stat(fullPath);
          
          items.push({
            name: item,
            path: fullPath,
            isDirectory: itemStats.isDirectory(),
            isFile: itemStats.isFile(),
            isSymbolicLink: itemStats.isSymbolicLink(),
            size: itemStats.isDirectory() ? await this.getDirectorySize(fullPath) : itemStats.size,
            sizeFormatted: itemStats.isDirectory() ? 
              await this.getDirectorySize(fullPath) : 
              this.formatBytes(itemStats.size),
            modified: itemStats.mtime,
            permissions: itemStats.mode.toString(8),
            owner: itemStats.uid,
            group: itemStats.gid
          });
        } catch (itemError) {
          console.log('Erro ao processar item', item, 'em', dirPath, ':', itemError.message);
          continue;
        }
      }

      // Ordenar: pastas primeiro, depois arquivos
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      return {
        currentPath: dirPath,
        parentPath: this.getParentPath(dirPath),
        items: items,
        breadcrumbs: this.generateBreadcrumbs(dirPath),
        stats: {
          totalItems: items.length,
          directories: items.filter(item => item.isDirectory).length,
          files: items.filter(item => item.isFile).length,
          totalSize: await this.getDirectorySize(dirPath)
        }
      };

    } catch (error) {
      console.error('Erro ao navegar na pasta:', error);
      throw error;
    }
  }

  // Criar nova pasta
  async createDirectory(dirPath, folderName) {
    try {
      const newPath = path.join(dirPath, folderName);
      
      if (await fs.pathExists(newPath)) {
        throw new Error('Pasta já existe');
      }

      await fs.mkdir(newPath, { recursive: true });
      
      return {
        success: true,
        path: newPath,
        message: 'Pasta criada com sucesso'
      };

    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      throw error;
    }
  }



  // Renomear pasta ou arquivo
  async renameItem(oldPath, newName) {
    try {
      if (!await fs.pathExists(oldPath)) {
        throw new Error('Item não encontrado');
      }

      const newPath = path.join(path.dirname(oldPath), newName);
      
      if (await fs.pathExists(newPath)) {
        throw new Error('Nome já existe');
      }

      await fs.move(oldPath, newPath);
      
      return {
        success: true,
        oldPath: oldPath,
        newPath: newPath,
        message: 'Item renomeado com sucesso'
      };

    } catch (error) {
      console.error('Erro ao renomear item:', error);
      throw error;
    }
  }

  // Obter tamanho de pasta
  async getDirectorySize(dirPath) {
    try {
      let totalSize = 0;
      const items = await fs.readdir(dirPath);
      
      // Limitar profundidade para evitar loops infinitos
      const maxDepth = 3;
      const currentDepth = dirPath.split(path.sep).length - 1;
      
      if (currentDepth > maxDepth) {
        return 0;
      }
      
      // Lista de diretórios do sistema para pular
      const systemDirs = ['proc', 'sys', 'dev', 'run', 'tmp', 'var'];
      const currentDirName = path.basename(dirPath);
      
      // Pular diretórios do sistema
      if (systemDirs.includes(currentDirName) && dirPath.startsWith('/')) {
        console.log('Pulando diretório do sistema:', dirPath);
        return 0;
      }
      
      for (const item of items) {
        try {
          // Pular arquivos e diretórios do sistema
          if (item.startsWith('.') || systemDirs.includes(item)) {
            continue;
          }
          
          const fullPath = path.join(dirPath, item);
          const stats = await fs.stat(fullPath);
          
          if (stats.isDirectory()) {
            totalSize += await this.getDirectorySize(fullPath);
          } else {
            totalSize += stats.size;
          }
        } catch (itemError) {
          // Log apenas erros de permissão, não de arquivos inexistentes
          if (itemError.code !== 'ENOENT') {
            console.log('Erro ao processar item', item, 'em', dirPath, ':', itemError.message);
          }
          continue;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.log('Erro ao obter tamanho da pasta', dirPath, ':', error.message);
      return 0;
    }
  }

  // Obter espaço livre
  async getFreeSpace(dirPath) {
    try {
      // Usar fs.statfs se disponível, senão retornar 0
      if (fs.statfs) {
        const stats = await fs.statfs(dirPath);
        return stats.bavail * stats.bsize;
      } else {
        // Fallback para sistemas que não suportam statfs
        return 0;
      }
    } catch (error) {
      console.log('Erro ao obter espaço livre para', dirPath, ':', error.message);
      return 0;
    }
  }

  // Formatar bytes para legibilidade
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Gerar breadcrumbs
  generateBreadcrumbs(currentPath) {
    const parts = currentPath.split(path.sep).filter(part => part);
    const breadcrumbs = [];
    
    let currentFullPath = '';
    
    for (let i = 0; i < parts.length; i++) {
      currentFullPath += (i === 0 ? '' : path.sep) + parts[i];
      
      // Só adicionar breadcrumbs para caminhos permitidos
      if (this.isPathAllowed(currentFullPath) || currentFullPath === '/mnt' || currentFullPath === '/media') {
        breadcrumbs.push({
          name: parts[i],
          path: currentFullPath,
          isLast: i === parts.length - 1
        });
      }
    }
    
    return breadcrumbs;
  }

  // Verificar se o caminho é permitido
  isPathAllowed(dirPath) {
    // Permitir apenas caminhos que começam com /mnt ou /media
    return dirPath.startsWith('/mnt/') || dirPath.startsWith('/media/');
  }

  // Obter caminho pai de forma segura
  getParentPath(dirPath) {
    const parent = path.dirname(dirPath);
    
    // Se o caminho pai não estiver nos diretórios permitidos, retornar o diretório raiz permitido
    if (!this.isPathAllowed(parent) && parent !== '/') {
      if (dirPath.startsWith('/mnt/')) {
        return '/mnt';
      } else if (dirPath.startsWith('/media/')) {
        return '/media';
      }
    }
    
    return parent;
  }

  // Verificar permissões
  async checkPermissions(dirPath) {
    try {
      await fs.access(dirPath, fs.constants.R_OK | fs.constants.W_OK);
      return {
        readable: true,
        writable: true,
        message: 'Acesso total'
      };
    } catch (error) {
      try {
        await fs.access(dirPath, fs.constants.R_OK);
        return {
          readable: true,
          writable: false,
          message: 'Apenas leitura'
        };
      } catch {
        return {
          readable: false,
          writable: false,
          message: 'Sem acesso'
        };
      }
    }
  }

  // Obter informações do sistema
  async getSystemInfo() {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      
      return {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        memory: {
          total: this.formatBytes(totalMem),
          used: this.formatBytes(usedMem),
          free: this.formatBytes(freeMem),
          usagePercent: ((usedMem / totalMem) * 100).toFixed(2)
        },
        cpus: os.cpus().length,
        loadAverage: os.loadavg()
      };
    } catch (error) {
      console.error('Erro ao obter informações do sistema:', error);
      return null;
    }
  }

  // Buscar arquivos/pastas
  async searchItems(searchPath, query, recursive = false) {
    try {
      const results = [];
      
      if (!await fs.pathExists(searchPath)) {
        return results;
      }

      const searchInDirectory = async (dirPath) => {
        try {
          const items = await fs.readdir(dirPath);
          
          for (const item of items) {
            const fullPath = path.join(dirPath, item);
            
            // Verificar se o nome contém a query
            if (item.toLowerCase().includes(query.toLowerCase())) {
              const stats = await fs.stat(fullPath);
              results.push({
                name: item,
                path: fullPath,
                isDirectory: stats.isDirectory(),
                size: stats.isDirectory() ? await this.getDirectorySize(fullPath) : stats.size,
                sizeFormatted: stats.isDirectory() ? 
                  await this.getDirectorySize(fullPath) : 
                  this.formatBytes(stats.size),
                modified: stats.mtime,
                relativePath: path.relative(searchPath, fullPath)
              });
            }
            
            // Busca recursiva se habilitada
            if (recursive && stats.isDirectory()) {
              await searchInDirectory(fullPath);
            }
          }
        } catch (error) {
          // Ignorar erros de permissão durante a busca
          console.warn(`Erro ao buscar em ${dirPath}:`, error.message);
        }
      };

      await searchInDirectory(searchPath);
      return results;

    } catch (error) {
      console.error('Erro na busca:', error);
      return [];
    }
  }
}

module.exports = new FileSystemService();
