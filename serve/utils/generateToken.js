const jwt = require("jsonwebtoken"); // Para gerar JSON Web Tokens

// Função auxiliar para enviar resposta JWT com cookie HTTP-only
const sendTokenResponse = (user, statusCode, res) => {
  // 1. Gerar o token JWT
  // O método getSignedJwtToken() é definido no modelo User (User.js)
  const token = user.getSignedJwtToken();

  // 2. Configurar opções do cookie
  const options = {
    // Expiração do cookie: Converte dias de JWT_COOKIE_EXPIRE para milissegundos
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Torna o cookie acessível apenas pelo servidor (segurança contra XSS)
    secure: process.env.NODE_ENV === "production", // Apenas para HTTPS em produção
  };

  // 3. Enviar o cookie e a resposta JSON
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token: token,
      user: {
        // Retorna alguns dados do usuário logado para o frontend
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

module.exports = sendTokenResponse;
