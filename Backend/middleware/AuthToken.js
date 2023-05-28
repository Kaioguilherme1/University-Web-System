const jwt = require('jsonwebtoken');
const auth = require("../config/auth");

// Verifica se o token é válido
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, auth.secret);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Gera um token
function generateToken(payload) {
  return  jwt.sign(payload, auth.secret, {expiresIn: auth.expireIn});
}

// Verifica se o usuário é admin
function isAdmin(token) {
  try {
    const decoded = jwt.verify(token, auth.secret);
    return decoded.profile === 'admin';
  } catch (error) {
    return false;
  }
}

function isOwner(token, id) {
  try {
    // Verificar se o token é válido e decodificá-lo
    const decoded = validateToken(token);
    const userId = decoded.id;
    return userId === id;
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    return false; // Ocorreu um erro na verificação do token
  }
}

function hasPermission(token, id, role = 'admin') {
    try {
        // Verificar se o token é válido e decodificá-lo
        const decoded = validateToken(token);
        const userId = decoded.id;
        const profile = decoded.profile;
        return profile === role || userId === id;
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        return false; // Ocorreu um erro na verificação do token
    }
}

module.exports = {
    validateToken,
    generateToken,
    isAdmin,
    isOwner,
    hasPermission
}