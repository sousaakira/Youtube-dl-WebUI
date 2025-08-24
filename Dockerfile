# Dockerfile para Youtube-dl WebUI Node.js

# Usar imagem base Node.js Alpine para menor tamanho
FROM node:18-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    python3 \
    py3-pip \
    ffmpeg \
    && pip3 install --upgrade pip \
    && pip3 install yt-dlp

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências Node.js
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p downloads logs

# Definir permissões adequadas
RUN chown -R node:node /app
USER node

# Expor porta da aplicação
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000
ENV YTDLP_BIN=/usr/local/bin/yt-dlp
ENV OUTPUT_FOLDER=/app/downloads
ENV LOG_FOLDER=/app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/download', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Comando para iniciar a aplicação
CMD ["npm", "start"]
