# Youtube-dl WebUI

A modern web interface for downloading media from various platforms using yt-dlp, converted from PHP to Node.js.

## 🌍 Language Versions

- [English](README.md) (Main)
- [Português](README.pt.md)
- [Español](README.es.md)

## 🚀 Features

- **Media Download**: Download videos, audio, and other media from supported platforms
- **File System Browser**: Secure file browser for navigating mounted disks and media folders
- **Multiple Format Support**: Choose video quality and audio formats
- **Batch Downloads**: Download multiple URLs simultaneously
- **Custom Output Paths**: Select custom download destinations
- **Real-time Progress**: Monitor download progress in real-time
- **Security**: Secure authentication and file system access restrictions
- **Modern UI**: Responsive Bootstrap-based interface

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: EJS templates + Bootstrap 5
- **File System**: fs-extra for secure file operations
- **Media Processing**: yt-dlp + ffmpeg
- **Authentication**: Custom session-based auth system
- **Security**: Helmet.js for security headers

## 📋 Prerequisites

- Node.js 18+ 
- yt-dlp installed and accessible
- ffmpeg (for audio extraction)
- Linux/Unix system (for file system operations)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sousaakira/Youtube-dl-WebUI.git
   cd Youtube-dl-WebUI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your preferences
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the application**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `localhost` |
| `SECURITY_ENABLED` | Enable authentication | `false` |
| `ADMIN_PASSWORD` | Admin password (MD5 hash) | `63a9f0ea7bb98050796b649e85481845` |
| `OUTPUT_FOLDER` | Default download folder | `./downloads` |
| `YTDLP_BIN` | yt-dlp binary path | `/usr/bin/yt-dlp` |
| `MAX_DOWNLOADS` | Max concurrent downloads | `3` |

### File System Security

The application restricts file system access to:
- `/mnt/*` - Mounted disks
- `/media/*` - User media folders

System directories and other sensitive paths are blocked for security.

## 📁 Project Structure

```
src/
├── app.js                 # Main application file
├── config/               # Configuration files
├── middleware/           # Authentication middleware
├── routes/               # Route definitions
├── services/             # Business logic services
├── views/                # EJS templates
└── public/               # Static assets (CSS, JS, images)
```

## 🔐 Security Features

- **Authentication**: Session-based user authentication
- **File System Restrictions**: Limited access to safe directories only
- **Input Validation**: Comprehensive input sanitization
- **Security Headers**: Helmet.js for security headers
- **No File Deletion**: File deletion functionality is disabled for safety

## 📱 Usage

### Download Media

1. Navigate to the Download page
2. Enter one or more URLs (separated by spaces or commas)
3. Choose download options:
   - Audio only
   - Custom filename template
   - Video format
   - Custom download path
4. Click "Download"

### File System Browser

1. Navigate to the File System Browser
2. Browse available disks and folders
3. Navigate through directories
4. View file information and permissions
5. Create new folders
6. Rename files and folders

## 🐳 Docker Support

### Using Docker Compose

```bash
docker-compose up -d
```

### Manual Docker Build

```bash
docker build -t youtube-dl-webui .
docker run -p 3000:3000 -v /path/to/downloads:/app/downloads youtube-dl-webui
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for personal use only. Please respect copyright laws and terms of service of the platforms you download from.

## 🆘 Support

If you encounter any issues:

1. Check the logs in the application
2. Verify yt-dlp and ffmpeg are properly installed
3. Check file permissions for download directories
4. Open an issue on GitHub with detailed information

## 🔄 Migration from PHP

This application was converted from a PHP-based Youtube-dl WebUI. The conversion includes:

- Complete backend rewrite in Node.js
- Modern Express.js architecture
- Enhanced security features
- Improved file system browser
- Better error handling and logging

---

## 📚 Repository

- **GitHub**: [https://github.com/sousaakira/Youtube-dl-WebUI](https://github.com/sousaakira/Youtube-dl-WebUI)
- **Clone URL**: `https://github.com/sousaakira/Youtube-dl-WebUI.git`

**Note**: This is a production-ready application with security features enabled by default. Always review and customize security settings for your specific deployment environment.
