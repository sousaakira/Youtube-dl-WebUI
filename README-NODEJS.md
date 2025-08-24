# Youtube-dl WebUI - Versão Node.js

![Main](https://github.com/timendum/Youtube-dl-WebUI/raw/master/img/main.png)

## Descrição

Esta é uma conversão completa do **Youtube-dl WebUI** original (PHP) para **Node.js**. A aplicação permite hospedar seu próprio baixador de vídeos com uma interface web moderna e responsiva.

## Funcionalidades

- ✅ **Downloads simultâneos** em background com limite configurável
- ✅ **Suporte a yt-dlp e youtube-dl** (e outros forks compatíveis)
- ✅ **Sistema de logs** completo para acompanhar downloads
- ✅ **Extração de áudio** com ffmpeg
- ✅ **Interface web moderna** com Bootstrap 5 e EJS
- ✅ **Sistema de autenticação** configurável
- ✅ **Gerenciamento de arquivos** (listar, baixar, deletar, streaming)
- ✅ **Validação de URLs** e formulários
- ✅ **Responsivo** para dispositivos móveis
- ✅ **API RESTful** para integrações
- ✅ **Streaming de mídia** nativo

## Requisitos

- **Node.js** >= 16.0.0
- **yt-dlp** ou **youtube-dl** instalado no sistema
- **ffmpeg** para extração de áudio (opcional)
- **Sistema Unix/Linux** (recomendado)

## Instalação

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd youtube-dl-webui-nodejs
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do servidor
PORT=3000
NODE_ENV=development
SESSION_SECRET=sua-chave-secreta-aqui

# Configurações de segurança
SECURITY_ENABLED=true
ADMIN_PASSWORD=63a9f0ea7bb98050796b649e85481845

# Configurações de download
YTDLP_BIN=/usr/bin/yt-dlp
OUTPUT_FOLDER=./downloads
LOG_FOLDER=./logs
MAX_DOWNLOADS=3
DOWNLOAD_TIMEOUT=3600

# Configurações de formato
DEFAULT_VIDEO_FORMAT=best
AUDIO_FORMAT=mp3
AUDIO_QUALITY=192
```

### 4. Verificar instalações do sistema

Certifique-se de que o **yt-dlp** está instalado:

```bash
# Verificar se yt-dlp está disponível
which yt-dlp

# Verificar versão
yt-dlp --version

# Instalar se necessário (Ubuntu/Debian)
sudo apt update
sudo apt install yt-dlp

# Ou via pip
pip install yt-dlp
```

### 5. Iniciar a aplicação

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

A aplicação estará disponível em: `http://localhost:3000`

## Estrutura do Projeto

```
src/
├── config/           # Configurações da aplicação
├── controllers/      # Controladores (se necessário)
├── middleware/       # Middlewares (autenticação, validação)
├── routes/          # Rotas da aplicação
├── services/        # Lógica de negócio
├── views/           # Templates EJS
│   ├── layouts/     # Layouts base
│   ├── auth/        # Páginas de autenticação
│   ├── download/    # Páginas de download
│   └── files/       # Páginas de arquivos
└── public/          # Arquivos estáticos
    ├── css/         # Estilos CSS
    ├── js/          # JavaScript
    └── img/         # Imagens

downloads/           # Pasta de downloads (criada automaticamente)
logs/               # Pasta de logs (criada automaticamente)
```

## Uso

### 1. Acessar a aplicação

- **URL**: `http://localhost:3000`
- **Login padrão**: `root` (senha padrão)

### 2. Fazer download

1. Cole a(s) URL(s) do(s) vídeo(s) no campo
2. Escolha as opções (áudio apenas, formato, nome do arquivo)
3. Clique em "Download"
4. Acompanhe o progresso na seção "Downloads Ativos"

### 3. Gerenciar arquivos

- **Lista de arquivos**: Visualize todos os downloads
- **Download**: Baixe arquivos para seu computador
- **Streaming**: Reproduza arquivos diretamente no navegador
- **Deletar**: Remova arquivos desnecessários

### 4. Visualizar logs

- Acompanhe o progresso dos downloads
- Verifique erros e informações detalhadas
- Monitore o sistema

## Configuração Avançada

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `PORT` | Porta do servidor | 3000 |
| `NODE_ENV` | Ambiente (development/production) | development |
| `SESSION_SECRET` | Chave secreta para sessões | - |
| `SECURITY_ENABLED` | Habilitar autenticação | false |
| `ADMIN_PASSWORD` | Hash MD5 da senha admin | root |
| `YTDLP_BIN` | Caminho para o binário yt-dlp | /usr/bin/yt-dlp |
| `OUTPUT_FOLDER` | Pasta de downloads | ./downloads |
| `LOG_FOLDER` | Pasta de logs | ./logs |
| `MAX_DOWNLOADS` | Downloads simultâneos | 3 |

### Personalização de Templates

Os templates EJS estão em `src/views/` e podem ser personalizados:

- **Layout base**: `src/views/layouts/main.ejs`
- **Página de download**: `src/views/download/index.ejs`
- **Lista de arquivos**: `src/views/files/index.ejs`
- **Página de login**: `src/views/auth/login.ejs`

### Personalização de Estilos

O CSS personalizado está em `src/public/css/style.css` e pode ser modificado para:

- Cores e temas
- Layout responsivo
- Animações e transições
- Componentes personalizados

## API Endpoints

### Autenticação

- `GET /auth/login` - Página de login
- `POST /auth/login` - Processar login
- `GET /auth/logout` - Logout
- `GET /auth/change-password` - Alterar senha

### Download

- `GET /download` - Página principal de download
- `POST /download` - Iniciar download
- `POST /download/info` - Obter informações do vídeo
- `GET /download/status` - Status dos downloads ativos
- `POST /download/stop-all` - Parar todos os downloads
- `POST /download/stop/:id` - Parar download específico

### Arquivos

- `GET /files` - Lista de arquivos
- `GET /files/download/:filename` - Baixar arquivo
- `GET /files/stream/:filename` - Streaming de arquivo
- `DELETE /files/:filename` - Deletar arquivo
- `GET /files/logs` - Lista de logs
- `GET /files/logs/:filename` - Visualizar log específico

## Desenvolvimento

### Scripts NPM

```bash
# Desenvolvimento com auto-reload
npm run dev

# Produção
npm start

# Testes
npm test

# Linting (se configurado)
npm run lint
```

### Estrutura de Desenvolvimento

- **ES6+**: Código moderno com async/await
- **MVC Pattern**: Separação clara de responsabilidades
- **Middleware**: Sistema flexível de middlewares
- **Services**: Lógica de negócio isolada
- **Templates EJS**: Renderização server-side eficiente

### Adicionando Novas Funcionalidades

1. **Nova rota**: Adicione em `src/routes/`
2. **Novo serviço**: Crie em `src/services/`
3. **Novo template**: Adicione em `src/views/`
4. **Novo middleware**: Crie em `src/middleware/`

## Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  youtube-dl-webui:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./downloads:/app/downloads
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - SECURITY_ENABLED=true
    restart: unless-stopped
```

## Troubleshooting

### Problemas Comuns

1. **yt-dlp não encontrado**
   ```bash
   # Verificar instalação
   which yt-dlp
   
   # Instalar se necessário
   sudo apt install yt-dlp
   ```

2. **Permissões de pasta**
   ```bash
   # Corrigir permissões
   sudo chown -R $USER:$USER downloads logs
   chmod 755 downloads logs
   ```

3. **Porta em uso**
   ```bash
   # Verificar portas em uso
   netstat -tulpn | grep :3000
   
   # Alterar porta no .env
   PORT=3001
   ```

4. **Erro de sessão**
   ```bash
   # Limpar sessões antigas
   rm -rf node_modules/.cache
   ```

### Logs

- **Logs da aplicação**: Console do terminal
- **Logs de download**: Pasta `logs/`
- **Logs do sistema**: Depende do sistema operacional

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## Créditos

- **Original**: [Youtube-dl WebUI](https://github.com/timendum/Youtube-dl-WebUI) por Timendum
- **Conversão para Node.js**: Convertido e adaptado para Node.js
- **Tecnologias**: Express.js, EJS, Bootstrap 5, yt-dlp

## Suporte

Para suporte e questões:

- Abra uma issue no GitHub
- Verifique a documentação
- Consulte os logs da aplicação
- Verifique os requisitos do sistema

---

**Nota**: Esta é uma conversão completa do projeto PHP original. Todas as funcionalidades principais foram mantidas e melhoradas para o ecossistema Node.js.
