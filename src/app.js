const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const expressLayouts = require('express-ejs-layouts');

// Import routes
const authRoutes = require('./routes/auth');
const downloadRoutes = require('./routes/download');
const fileRoutes = require('./routes/files');
const fileSystemRoutes = require('./routes/fileSystem');

// Import middleware
const { isAuthenticated } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure required directories exist
const requiredDirs = ['downloads', 'logs', 'config'];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP temporariamente para debug
}));

app.use(compression());
app.use(morgan('combined'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/downloads', express.static(path.join(__dirname, '../downloads')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/img/favicon.ico')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.warning_msg = req.flash('warning_msg');
  next();
});

// Apply security middleware to all routes
const { isSecurityEnabled, devAuth } = require('./middleware/auth');
app.use(isSecurityEnabled);
app.use(devAuth);

// Routes
app.use('/auth', authRoutes);
app.use('/download', isAuthenticated, downloadRoutes);
app.use('/files', isAuthenticated, fileRoutes);
app.use('/filesystem', isAuthenticated, fileSystemRoutes);

// Home route
app.get('/', isAuthenticated, (req, res) => {
  res.redirect('/download');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Erro',
    message: 'Algo deu errado!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Página não encontrada',
    message: 'A página solicitada não foi encontrada.',
    error: {}
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app;
