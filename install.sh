#!/bin/bash

# Script de instalação para Youtube-dl WebUI Node.js
# Este script automatiza a instalação e configuração da aplicação

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Youtube-dl WebUI - Node.js${NC}"
    echo -e "${BLUE}  Script de Instalação${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar se o usuário é root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "Este script não deve ser executado como root"
        exit 1
    fi
}

# Função para verificar sistema operacional
check_os() {
    print_message "Verificando sistema operacional..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            OS="debian"
            print_message "Sistema Debian/Ubuntu detectado"
        elif command_exists yum; then
            OS="redhat"
            print_message "Sistema RedHat/CentOS detectado"
        elif command_exists pacman; then
            OS="arch"
            print_message "Sistema Arch Linux detectado"
        else
            print_error "Sistema operacional não suportado"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_message "Sistema macOS detectado"
    else
        print_error "Sistema operacional não suportado"
        exit 1
    fi
}

# Função para instalar Node.js
install_nodejs() {
    print_message "Verificando Node.js..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
        
        if [[ $NODE_MAJOR -ge 16 ]]; then
            print_message "Node.js $NODE_VERSION já está instalado"
            return 0
        else
            print_warning "Node.js $NODE_VERSION encontrado, mas versão 16+ é necessária"
        fi
    fi
    
    print_message "Instalando Node.js..."
    
    case $OS in
        "debian")
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "redhat")
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
            ;;
        "arch")
            sudo pacman -S --noconfirm nodejs npm
            ;;
        "macos")
            if command_exists brew; then
                brew install node
            else
                print_error "Homebrew não encontrado. Instale o Homebrew primeiro:"
                print_error "https://brew.sh/"
                exit 1
            fi
            ;;
    esac
    
    print_message "Node.js instalado com sucesso: $(node --version)"
}

# Função para instalar yt-dlp
install_ytdlp() {
    print_message "Verificando yt-dlp..."
    
    if command_exists yt-dlp; then
        print_message "yt-dlp já está instalado: $(yt-dlp --version)"
        return 0
    fi
    
    print_message "Instalando yt-dlp..."
    
    case $OS in
        "debian")
            sudo apt-get update
            sudo apt-get install -y yt-dlp
            ;;
        "redhat")
            sudo yum install -y yt-dlp
            ;;
        "arch")
            sudo pacman -S --noconfirm yt-dlp
            ;;
        "macos")
            if command_exists brew; then
                brew install yt-dlp
            else
                sudo pip3 install yt-dlp
            fi
            ;;
    esac
    
    if ! command_exists yt-dlp; then
        print_warning "Instalação via package manager falhou, tentando via pip..."
        sudo pip3 install yt-dlp
    fi
    
    print_message "yt-dlp instalado com sucesso: $(yt-dlp --version)"
}

# Função para instalar ffmpeg
install_ffmpeg() {
    print_message "Verificando ffmpeg..."
    
    if command_exists ffmpeg; then
        print_message "ffmpeg já está instalado: $(ffmpeg -version | head -n1)"
        return 0
    fi
    
    print_message "Instalando ffmpeg..."
    
    case $OS in
        "debian")
            sudo apt-get update
            sudo apt-get install -y ffmpeg
            ;;
        "redhat")
            sudo yum install -y ffmpeg
            ;;
        "arch")
            sudo pacman -S --noconfirm ffmpeg
            ;;
        "macos")
            if command_exists brew; then
                brew install ffmpeg
            else
                print_error "Homebrew não encontrado para instalar ffmpeg"
                exit 1
            fi
            ;;
    esac
    
    print_message "ffmpeg instalado com sucesso: $(ffmpeg -version | head -n1)"
}

# Função para instalar dependências Node.js
install_dependencies() {
    print_message "Instalando dependências Node.js..."
    
    if [[ ! -f "package.json" ]]; then
        print_error "package.json não encontrado. Execute este script no diretório raiz do projeto."
        exit 1
    fi
    
    npm install
    
    print_message "Dependências instaladas com sucesso"
}

# Função para criar arquivo de configuração
create_env_file() {
    print_message "Criando arquivo de configuração..."
    
    if [[ -f ".env" ]]; then
        print_warning "Arquivo .env já existe. Fazendo backup..."
        cp .env .env.backup
    fi
    
    cat > .env << EOF
# Configurações do servidor
PORT=3000
NODE_ENV=development
HOST=localhost
SESSION_SECRET=$(openssl rand -hex 32)

# Configurações de segurança
SECURITY_ENABLED=true
ADMIN_PASSWORD=63a9f0ea7bb98050796b649e85481845

# Configurações de download
YTDLP_BIN=$(which yt-dlp)
OUTPUT_FOLDER=./downloads
LOG_FOLDER=./logs
MAX_DOWNLOADS=3
DOWNLOAD_TIMEOUT=3600

# Configurações de formato
DEFAULT_VIDEO_FORMAT=best
AUDIO_FORMAT=mp3
AUDIO_QUALITY=192

# Configurações de sessão
SESSION_LIFETIME=86400

# Configurações de log
LOG_ENABLED=true

# Configurações de extração
EXTRACTER=ffmpeg
OUTFILENAME=%(title)s-%(id)s.%(ext)s
EOF
    
    print_message "Arquivo .env criado com sucesso"
}

# Função para criar diretórios necessários
create_directories() {
    print_message "Criando diretórios necessários..."
    
    mkdir -p downloads logs
    
    print_message "Diretórios criados: downloads/, logs/"
}

# Função para configurar permissões
setup_permissions() {
    print_message "Configurando permissões..."
    
    chmod 755 downloads logs
    
    print_message "Permissões configuradas"
}

# Função para testar instalação
test_installation() {
    print_message "Testando instalação..."
    
    # Verificar se Node.js está funcionando
    if ! command_exists node; then
        print_error "Node.js não está funcionando"
        exit 1
    fi
    
    # Verificar se yt-dlp está funcionando
    if ! command_exists yt-dlp; then
        print_error "yt-dlp não está funcionando"
        exit 1
    fi
    
    # Verificar se ffmpeg está funcionando
    if ! command_exists ffmpeg; then
        print_error "ffmpeg não está funcionando"
        exit 1
    fi
    
    # Verificar se as dependências estão instaladas
    if [[ ! -d "node_modules" ]]; then
        print_error "Dependências Node.js não estão instaladas"
        exit 1
    fi
    
    print_message "Teste de instalação concluído com sucesso"
}

# Função para mostrar informações finais
show_final_info() {
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}  Instalação Concluída!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${BLUE}Para iniciar a aplicação:${NC}"
    echo -e "  npm run dev    # Modo desenvolvimento"
    echo -e "  npm start      # Modo produção"
    echo ""
    echo -e "${BLUE}A aplicação estará disponível em:${NC}"
    echo -e "  http://localhost:3000"
    echo ""
    echo -e "${BLUE}Credenciais padrão:${NC}"
    echo -e "  Senha: root"
    echo ""
    echo -e "${BLUE}Para usar Docker:${NC}"
    echo -e "  docker-compose up -d"
    echo ""
    echo -e "${BLUE}Arquivos importantes:${NC}"
    echo -e "  .env           # Configurações"
    echo -e "  downloads/     # Pasta de downloads"
    echo -e "  logs/          # Pasta de logs"
    echo ""
}

# Função principal
main() {
    print_header
    
    # Verificações iniciais
    check_root
    check_os
    
    # Instalação
    install_nodejs
    install_ytdlp
    install_ffmpeg
    install_dependencies
    
    # Configuração
    create_env_file
    create_directories
    setup_permissions
    
    # Teste final
    test_installation
    
    # Informações finais
    show_final_info
}

# Executar função principal
main "$@"
