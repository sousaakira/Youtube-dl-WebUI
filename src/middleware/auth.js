const config = require('../config/config');

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  req.flash('error_msg', 'Você precisa estar logado para acessar esta página.');
  res.redirect('/auth/login');
};

// Middleware para verificar se a autenticação está habilitada
const isSecurityEnabled = (req, res, next) => {
  if (config.security) {
    return next();
  }
  
  // Se a segurança não estiver habilitada, criar uma sessão automática
  if (!req.session.user) {
    req.session.user = { username: 'admin', isAdmin: true };
  }
  next();
};

// Middleware para desenvolvimento - sempre criar usuário se não existir
const devAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && !req.session.user) {
    req.session.user = { username: 'admin', isAdmin: true };
  }
  next();
};

// Middleware para verificar se o usuário é admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }
  
  req.flash('error_msg', 'Acesso negado. Você precisa ser administrador.');
  res.redirect('/download');
};

module.exports = {
  isAuthenticated,
  isSecurityEnabled,
  isAdmin,
  devAuth
};
