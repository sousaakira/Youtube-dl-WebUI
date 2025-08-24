# Youtube-dl WebUI

Una interfaz web moderna para descargar medios de varias plataformas usando yt-dlp, convertida de PHP a Node.js.

## 🌍 Versiones en Idiomas

- [English](README.md) (Principal)
- [Português](README.pt.md)
- [Español](README.es.md)

## 🚀 Características

- **Descarga de Medios**: Descarga videos, audio y otros medios de plataformas compatibles
- **Navegador de Archivos**: Navegador de archivos seguro para discos montados y carpetas de medios
- **Soporte a Múltiples Formatos**: Elige calidad de video y formatos de audio
- **Descargas en Lote**: Descarga múltiples URLs simultáneamente
- **Rutas de Salida Personalizadas**: Selecciona destinos de descarga personalizados
- **Progreso en Tiempo Real**: Monitorea el progreso de la descarga en tiempo real
- **Seguridad**: Autenticación segura y restricciones de acceso al sistema de archivos
- **Interfaz Moderna**: Interfaz responsiva basada en Bootstrap

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express.js
- **Frontend**: Plantillas EJS + Bootstrap 5
- **Sistema de Archivos**: fs-extra para operaciones seguras de archivos
- **Procesamiento de Medios**: yt-dlp + ffmpeg
- **Autenticación**: Sistema de autenticación personalizado basado en sesión
- **Seguridad**: Helmet.js para encabezados de seguridad

## 📋 Prerrequisitos

- Node.js 18+
- yt-dlp instalado y accesible
- ffmpeg (para extracción de audio)
- Sistema Linux/Unix (para operaciones del sistema de archivos)

## 🚀 Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/sousaakira/Youtube-dl-WebUI.git
   cd Youtube-dl-WebUI
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno** (opcional)
   ```bash
   cp .env.example .env
   # Edita .env con tus preferencias
   ```

4. **Inicia la aplicación**
   ```bash
   # Modo desarrollo
   npm run dev
   
   # Modo producción
   npm start
   ```

5. **Accede a la aplicación**
   ```
   http://localhost:3000
   ```

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Predeterminado |
|----------|-------------|----------------|
| `PORT` | Puerto del servidor | `3000` |
| `HOST` | Host del servidor | `localhost` |
| `SECURITY_ENABLED` | Habilitar autenticación | `false` |
| `ADMIN_PASSWORD` | Contraseña del admin (hash MD5) | `63a9f0ea7bb98050796b649e85481845` |
| `OUTPUT_FOLDER` | Carpeta de descarga predeterminada | `./downloads` |
| `YTDLP_BIN` | Ruta del binario yt-dlp | `/usr/bin/yt-dlp` |
| `MAX_DOWNLOADS` | Máximo de descargas simultáneas | `3` |

### Seguridad del Sistema de Archivos

La aplicación restringe el acceso al sistema de archivos a:
- `/mnt/*` - Discos montados
- `/media/*` - Carpetas de medios del usuario

Los directorios del sistema y otras rutas sensibles están bloqueados por seguridad.

## 📁 Estructura del Proyecto

```
src/
├── app.js                 # Archivo principal de la aplicación
├── config/               # Archivos de configuración
├── middleware/           # Middleware de autenticación
├── routes/               # Definiciones de rutas
├── services/             # Servicios de lógica de negocio
├── views/                # Plantillas EJS
└── public/               # Activos estáticos (CSS, JS, imágenes)
```

## 🔐 Características de Seguridad

- **Autenticación**: Autenticación de usuario basada en sesión
- **Restricciones del Sistema de Archivos**: Acceso limitado solo a directorios seguros
- **Validación de Entrada**: Sanitización integral de entrada
- **Encabezados de Seguridad**: Helmet.js para encabezados de seguridad
- **Sin Eliminación de Archivos**: Funcionalidad de eliminación de archivos deshabilitada por seguridad

## 📱 Uso

### Descarga de Medios

1. Navega a la página de Descarga
2. Ingresa una o más URLs (separadas por espacios o comas)
3. Elige las opciones de descarga:
   - Solo audio
   - Plantilla de nombre de archivo personalizada
   - Formato de video
   - Ruta de descarga personalizada
4. Haz clic en "Descargar"

### Navegador del Sistema de Archivos

1. Navega al Navegador del Sistema de Archivos
2. Explora los discos y carpetas disponibles
3. Navega por los directorios
4. Visualiza información de archivos y permisos
5. Crea nuevas carpetas
6. Renombra archivos y carpetas

## 🐳 Soporte de Docker

### Usando Docker Compose

```bash
docker-compose up -d
```

### Build Manual de Docker

```bash
docker build -t youtube-dl-webui .
docker run -p 3000:3000 -v /ruta/a/descargas:/app/downloads youtube-dl-webui
```

## 🤝 Contribuyendo

1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad
3. Haz tus cambios
4. Agrega pruebas si es aplicable
5. Envía un pull request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - vea el archivo [LICENSE](LICENSE) para detalles.

## ⚠️ Descargo de Responsabilidad

Esta herramienta es para uso personal únicamente. Por favor, respeta las leyes de derechos de autor y los términos de servicio de las plataformas de las que descargas.

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa los logs en la aplicación
2. Verifica que yt-dlp y ffmpeg estén instalados correctamente
3. Verifica los permisos de archivo para directorios de descarga
4. Abre una issue en GitHub con información detallada

## 🔄 Migración de PHP

Esta aplicación fue convertida de un Youtube-dl WebUI basado en PHP. La conversión incluye:

- Reescritura completa del backend en Node.js
- Arquitectura moderna Express.js
- Características de seguridad mejoradas
- Navegador del sistema de archivos mejorado
- Mejor manejo de errores y logging

---

## 📚 Repositorio

- **GitHub**: [https://github.com/sousaakira/Youtube-dl-WebUI](https://github.com/sousaakira/Youtube-dl-WebUI)
- **URL de Clonación**: `https://github.com/sousaakira/Youtube-dl-WebUI.git`

**Nota**: Esta es una aplicación lista para producción con características de seguridad habilitadas por defecto. Siempre revisa y personaliza las configuraciones de seguridad para tu entorno de implementación específico.
