# Youtube-dl WebUI

Uma interface web moderna para baixar mídia de várias plataformas usando yt-dlp, convertida de PHP para Node.js.

## 🌍 Versões em Idiomas

- [English](README.md) (Principal)
- [Português](README.pt.md)
- [Español](README.es.md)

## 🚀 Funcionalidades

- **Download de Mídia**: Baixe vídeos, áudio e outras mídias de plataformas suportadas
- **Navegador de Arquivos**: Navegador de arquivos seguro para discos montados e pastas de mídia
- **Suporte a Múltiplos Formatos**: Escolha qualidade de vídeo e formatos de áudio
- **Downloads em Lote**: Baixe múltiplas URLs simultaneamente
- **Caminhos de Saída Personalizados**: Selecione destinos de download personalizados
- **Progresso em Tempo Real**: Monitore o progresso do download em tempo real
- **Segurança**: Autenticação segura e restrições de acesso ao sistema de arquivos
- **Interface Moderna**: Interface responsiva baseada em Bootstrap

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express.js
- **Frontend**: Templates EJS + Bootstrap 5
- **Sistema de Arquivos**: fs-extra para operações seguras de arquivos
- **Processamento de Mídia**: yt-dlp + ffmpeg
- **Autenticação**: Sistema de autenticação personalizado baseado em sessão
- **Segurança**: Helmet.js para cabeçalhos de segurança

## 📋 Pré-requisitos

- Node.js 18+
- yt-dlp instalado e acessível
- ffmpeg (para extração de áudio)
- Sistema Linux/Unix (para operações do sistema de arquivos)

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/sousaakira/Youtube-dl-WebUI.git
   cd Youtube-dl-WebUI
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente** (opcional)
   ```bash
   cp .env.example .env
   # Edite .env com suas preferências
   ```

4. **Inicie a aplicação**
   ```bash
   # Modo desenvolvimento
   npm run dev
   
   # Modo produção
   npm start
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `3000` |
| `HOST` | Host do servidor | `localhost` |
| `SECURITY_ENABLED` | Habilitar autenticação | `false` |
| `ADMIN_PASSWORD` | Senha do admin (hash MD5) | `63a9f0ea7bb98050796b649e85481845` |
| `OUTPUT_FOLDER` | Pasta de download padrão | `./downloads` |
| `YTDLP_BIN` | Caminho do binário yt-dlp | `/usr/bin/yt-dlp` |
| `MAX_DOWNLOADS` | Máximo de downloads simultâneos | `3` |

### Segurança do Sistema de Arquivos

A aplicação restringe o acesso ao sistema de arquivos para:
- `/mnt/*` - Discos montados
- `/media/*` - Pastas de mídia do usuário

Diretórios do sistema e outros caminhos sensíveis são bloqueados por segurança.

## 📁 Estrutura do Projeto

```
src/
├── app.js                 # Arquivo principal da aplicação
├── config/               # Arquivos de configuração
├── middleware/           # Middleware de autenticação
├── routes/               # Definições de rotas
├── services/             # Serviços de lógica de negócio
├── views/                # Templates EJS
└── public/               # Ativos estáticos (CSS, JS, imagens)
```

## 🔐 Funcionalidades de Segurança

- **Autenticação**: Autenticação de usuário baseada em sessão
- **Restrições do Sistema de Arquivos**: Acesso limitado apenas a diretórios seguros
- **Validação de Entrada**: Sanitização abrangente de entrada
- **Cabeçalhos de Segurança**: Helmet.js para cabeçalhos de segurança
- **Sem Exclusão de Arquivos**: Funcionalidade de exclusão de arquivos desabilitada por segurança

## 📱 Uso

### Download de Mídia

1. Navegue até a página de Download
2. Digite uma ou mais URLs (separadas por espaços ou vírgulas)
3. Escolha as opções de download:
   - Apenas áudio
   - Template de nome de arquivo personalizado
   - Formato de vídeo
   - Caminho de download personalizado
4. Clique em "Download"

### Navegador de Sistema de Arquivos

1. Navegue até o Navegador de Sistema de Arquivos
2. Navegue pelos discos e pastas disponíveis
3. Navegue pelos diretórios
4. Visualize informações de arquivos e permissões
5. Crie novas pastas
6. Renomeie arquivos e pastas

## 🐳 Suporte ao Docker

### Usando Docker Compose

```bash
docker-compose up -d
```

### Build Manual do Docker

```bash
docker build -t youtube-dl-webui .
docker run -p 3000:3000 -v /caminho/para/downloads:/app/downloads youtube-dl-webui
```

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua funcionalidade
3. Faça suas alterações
4. Adicione testes se aplicável
5. Envie um pull request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## ⚠️ Aviso Legal

Esta ferramenta é para uso pessoal apenas. Por favor, respeite as leis de direitos autorais e os termos de serviço das plataformas das quais você baixa.

## 🆘 Suporte

Se você encontrar algum problema:

1. Verifique os logs na aplicação
2. Verifique se yt-dlp e ffmpeg estão instalados corretamente
3. Verifique as permissões de arquivo para diretórios de download
4. Abra uma issue no GitHub com informações detalhadas

## 🔄 Migração do PHP

Esta aplicação foi convertida de um Youtube-dl WebUI baseado em PHP. A conversão inclui:

- Reescrita completa do backend em Node.js
- Arquitetura moderna Express.js
- Funcionalidades de segurança aprimoradas
- Navegador de sistema de arquivos melhorado
- Melhor tratamento de erros e logging

---

## 📚 Repositório

- **GitHub**: [https://github.com/sousaakira/Youtube-dl-WebUI](https://github.com/sousaakira/Youtube-dl-WebUI)
- **URL de Clone**: `https://github.com/sousaakira/Youtube-dl-WebUI.git`

**Nota**: Esta é uma aplicação pronta para produção com funcionalidades de segurança habilitadas por padrão. Sempre revise e personalize as configurações de segurança para seu ambiente de implantação específico.
