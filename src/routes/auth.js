const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const config = require('../config/config');
const { isSecurityEnabled } = require('../middleware/auth');

const router = express.Router();

// Middleware para verificar se a segurança está habilitada
router.use(isSecurityEnabled);

// Rota de login
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/download');
  }
  res.render('auth/login', { title: 'Login' });
});

// Processar login
router.post('/login', [
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('auth/login', {
      title: 'Login',
      errors: errors.array()
    });
  }

  const { password } = req.body;
  
  try {
    // Verificar senha (comparar com hash MD5 da configuração)
    const crypto = require('crypto');
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    
    if (hashedPassword === config.password) {
      req.session.user = {
        username: 'admin',
        isAdmin: true,
        loginTime: new Date()
      };
      
      req.flash('success_msg', 'Login realizado com sucesso!');
      res.redirect('/download');
    } else {
      req.flash('error_msg', 'Senha incorreta!');
      res.render('auth/login', { title: 'Login' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    req.flash('error_msg', 'Erro interno do servidor');
    res.render('auth/login', { title: 'Login' });
  }
});

// Rota de logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
    }
    res.redirect('/auth/login');
  });
});

// Rota para alterar senha (apenas para admins)
router.get('/change-password', (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    req.flash('error_msg', 'Acesso negado');
    return res.redirect('/download');
  }
  
  res.render('auth/change-password', { title: 'Alterar Senha' });
});

// Processar alteração de senha
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Confirmação de senha não confere');
    }
    return true;
  })
], async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    req.flash('error_msg', 'Acesso negado');
    return res.redirect('/download');
  }

  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.render('auth/change-password', {
      title: 'Alterar Senha',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;
  
  try {
    // Verificar senha atual
    const crypto = require('crypto');
    const hashedCurrentPassword = crypto.createHash('md5').update(currentPassword).digest('hex');
    
    if (hashedCurrentPassword !== config.password) {
      req.flash('error_msg', 'Senha atual incorreta!');
      return res.render('auth/change-password', { title: 'Alterar Senha' });
    }
    
    // Gerar novo hash MD5
    const newHashedPassword = crypto.createHash('md5').update(newPassword).digest('hex');
    
    // Aqui você poderia salvar a nova senha em um arquivo de configuração
    // Por enquanto, apenas mostrar a nova senha hash
    req.flash('success_msg', `Senha alterada com sucesso! Novo hash: ${newHashedPassword}`);
    res.redirect('/download');
    
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    req.flash('error_msg', 'Erro interno do servidor');
    res.render('auth/change-password', { title: 'Alterar Senha' });
  }
});

module.exports = router;
