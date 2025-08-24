// Youtube-dl WebUI - JavaScript personalizado

// Funções utilitárias
const Utils = {
    // Formatar bytes para formato legível
    formatBytes: function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    // Formatar data
    formatDate: function(date) {
        return new Date(date).toLocaleString('pt-BR');
    },
    
    // Validar URL
    isValidUrl: function(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },
    
    // Debounce function
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    // Mostrar notificação
    showNotification: function(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show notification-item`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Criar container de notificações se não existir
        let container = document.querySelector('.notification');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto-remover após duração especificada
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
        
        // Remover quando fechado
        notification.addEventListener('closed.bs.alert', () => {
            notification.remove();
        });
    }
};

// Gerenciador de downloads
const DownloadManager = {
    activeDownloads: new Map(),
    
    // Iniciar download
    startDownload: function(urls, options = {}) {
        const formData = new FormData();
        formData.append('urls', urls);
        
        if (options.audioOnly) {
            formData.append('audio', 'on');
        }
        
        if (options.outfilename) {
            formData.append('outfilename', options.outfilename);
        }
        
        if (options.vformat) {
            formData.append('vformat', options.vformat);
        }
        
        fetch('/download', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data && data.success) {
                Utils.showNotification('Download iniciado com sucesso!', 'success');
            }
        })
        .catch(error => {
            console.error('Erro ao iniciar download:', error);
            Utils.showNotification('Erro ao iniciar download', 'danger');
        });
    },
    
    // Obter informações do vídeo
    getVideoInfo: function(urls) {
        const formData = new FormData();
        formData.append('urls', urls);
        
        return fetch('/download/info', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .catch(error => {
            console.error('Erro ao obter informações do vídeo:', error);
            throw error;
        });
    },
    
    // Parar download
    stopDownload: function(downloadId) {
        if (confirm('Tem certeza que deseja parar este download?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `/download/stop/${downloadId}`;
            document.body.appendChild(form);
            form.submit();
        }
    },
    
    // Parar todos os downloads
    stopAllDownloads: function() {
        if (confirm('Tem certeza que deseja parar todos os downloads?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/download/stop-all';
            document.body.appendChild(form);
            form.submit();
        }
    },
    
    // Atualizar status dos downloads
    updateStatus: function() {
        fetch('/download/status')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.displayActiveDownloads(data.activeDownloads, data.activeCount);
                }
            })
            .catch(error => {
                console.error('Erro ao atualizar status:', error);
            });
    },
    
    // Exibir downloads ativos
    displayActiveDownloads: function(downloads, count) {
        const container = document.getElementById('activeDownloadsSection');
        const list = document.getElementById('activeDownloadsList');
        
        if (!container || !list) return;
        
        if (count > 0) {
            container.style.display = 'block';
            list.innerHTML = '';
            
            downloads.forEach(download => {
                const item = this.createDownloadItem(download);
                list.appendChild(item);
            });
        } else {
            container.style.display = 'none';
        }
    },
    
    // Criar item de download
    createDownloadItem: function(download) {
        const div = document.createElement('div');
        div.className = 'alert alert-info d-flex justify-content-between align-items-center';
        div.innerHTML = `
            <div>
                <strong>Download ID:</strong> ${download.id}<br>
                <small>URLs: ${download.urls.join(', ')}<br>
                Iniciado: ${Utils.formatDate(download.startTime)}</small>
            </div>
            <button class="btn btn-warning btn-sm" onclick="DownloadManager.stopDownload('${download.id}')">
                <i class="bi bi-stop"></i> Parar
            </button>
        `;
        return div;
    }
};

// Gerenciador de arquivos
const FileManager = {
    // Deletar arquivo
    deleteFile: function(filename) {
        if (confirm(`Tem certeza que deseja deletar o arquivo "${filename}"?`)) {
            fetch(`/files/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    Utils.showNotification('Arquivo deletado com sucesso!', 'success');
                    // Recarregar página para atualizar lista
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    throw new Error('Erro ao deletar arquivo');
                }
            })
            .catch(error => {
                console.error('Erro ao deletar arquivo:', error);
                Utils.showNotification('Erro ao deletar arquivo', 'danger');
            });
        }
    },
    
    // Baixar arquivo
    downloadFile: function(filename) {
        window.location.href = `/files/download/${encodeURIComponent(filename)}`;
    },
    
    // Reproduzir arquivo
    playFile: function(filename) {
        window.open(`/files/stream/${encodeURIComponent(filename)}`, '_blank');
    },
    
    // Verificar integridade do arquivo
    checkFileIntegrity: function(filename) {
        fetch(`/files/info/${encodeURIComponent(filename)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const status = data.integrity.valid ? 'válido' : 'inválido';
                    const message = `Arquivo ${status}: ${data.integrity.reason || data.integrity.size}`;
                    Utils.showNotification(message, data.integrity.valid ? 'success' : 'warning');
                }
            })
            .catch(error => {
                console.error('Erro ao verificar integridade:', error);
                Utils.showNotification('Erro ao verificar integridade do arquivo', 'danger');
            });
    }
};

// Gerenciador de logs
const LogManager = {
    // Carregar logs
    loadLogs: function() {
        fetch('/files/logs')
            .then(response => response.text())
            .then(html => {
                // Atualizar conteúdo da página de logs
                const container = document.querySelector('.logs-content');
                if (container) {
                    container.innerHTML = html;
                }
            })
            .catch(error => {
                console.error('Erro ao carregar logs:', error);
            });
    },
    
    // Visualizar log específico
    viewLog: function(filename) {
        window.location.href = `/files/logs/${encodeURIComponent(filename)}`;
    },
    
    // Deletar log
    deleteLog: function(filename) {
        if (confirm(`Tem certeza que deseja deletar o log "${filename}"?`)) {
            fetch(`/files/logs/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    Utils.showNotification('Log deletado com sucesso!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    throw new Error('Erro ao deletar log');
                }
            })
            .catch(error => {
                console.error('Erro ao deletar log:', error);
                Utils.showNotification('Erro ao deletar log', 'danger');
            });
        }
    }
};

// Gerenciador de formulários
const FormManager = {
    // Validar formulário de download
    validateDownloadForm: function(form) {
        const urls = form.querySelector('#urls').value.trim();
        
        if (!urls) {
            Utils.showNotification('Por favor, insira pelo menos uma URL.', 'warning');
            return false;
        }
        
        const urlArray = urls.split(/[\s,]+/);
        for (const url of urlArray) {
            if (url && !Utils.isValidUrl(url.trim())) {
                Utils.showNotification(`URL inválida: ${url.trim()}`, 'danger');
                return false;
            }
        }
        
        return true;
    },
    
    // Validar formulário de login
    validateLoginForm: function(form) {
        const password = form.querySelector('#password').value.trim();
        
        if (!password) {
            Utils.showNotification('Por favor, digite sua senha.', 'warning');
            return false;
        }
        
        return true;
    },
    
    // Limpar formulário
    clearForm: function(form) {
        form.reset();
        form.querySelector('input[type="text"], input[type="password"]').focus();
    }
};

// Gerenciador de UI
const UIManager = {
    // Inicializar tooltips
    initTooltips: function() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[title]'));
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    },
    
    // Inicializar popovers
    initPopovers: function() {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.forEach(popoverTriggerEl => {
            new bootstrap.Popover(popoverTriggerEl);
        });
    },
    
    // Mostrar/esconder loading
    showLoading: function(element) {
        if (element) {
            element.innerHTML = '<div class="loading"></div>';
            element.disabled = true;
        }
    },
    
    hideLoading: function(element, originalText) {
        if (element) {
            element.innerHTML = originalText;
            element.disabled = false;
        }
    },
    
    // Atualizar contadores
    updateCounters: function() {
        // Atualizar contador de arquivos
        const fileCount = document.querySelectorAll('.file-item').length;
        const fileCounter = document.querySelector('.file-counter');
        if (fileCounter) {
            fileCounter.textContent = fileCount;
        }
        
        // Atualizar contador de logs
        const logCount = document.querySelectorAll('.log-item').length;
        const logCounter = document.querySelector('.log-counter');
        if (logCounter) {
            logCounter.textContent = logCount;
        }
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes da UI
    UIManager.initTooltips();
    UIManager.initPopovers();
    
    // Configurar formulários
    const downloadForm = document.getElementById('download-form');
    if (downloadForm) {
        downloadForm.addEventListener('submit', function(e) {
            if (!FormManager.validateDownloadForm(this)) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (!FormManager.validateLoginForm(this)) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    // Inicializar gerenciador de downloads se estiver na página de download
    if (window.location.pathname === '/download') {
        DownloadManager.updateStatus();
        // Atualizar status a cada 5 segundos
        setInterval(() => {
            DownloadManager.updateStatus();
        }, 5000);
    }
    
    // Atualizar contadores
    UIManager.updateCounters();
    
    // Configurar auto-hide para alertas
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.parentNode) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 10000); // Auto-hide após 10 segundos
    });
    
    // Configurar confirmações para ações destrutivas
    const deleteButtons = document.querySelectorAll('[data-confirm]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });
});

// Exportar para uso global
window.YoutubeDLWebUI = {
    Utils,
    DownloadManager,
    FileManager,
    LogManager,
    FormManager,
    UIManager
};
