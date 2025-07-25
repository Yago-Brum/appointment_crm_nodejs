const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protege as rotas
exports.protect = async (req, res, next) => {
  let token;

  // Verifica se o token está no cabeçalho Authorization (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Ou se o token está nos cookies (geralmente é o caso com httpOnly)
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Certifique-se de que o token existe
  if (!token) {
    return next(new ErrorResponse("Não autorizado a aceder a esta rota", 401));
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Anexar o utilizador à requisição (sem a senha)
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse("Não autorizado a aceder a esta rota", 401));
  }
};

exports.authorize = (allowedRolesArray) => {
  return (req, res, next) => {
    // req.user é populado pelo middleware protect
    // Verifica se o usuário existe e se a role do usuário está entre as roles permitidas
    if (!req.user || !allowedRolesArray.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `A função do utilizador (${
            req.user ? req.user.role : "desconhecida"
          }) não está autorizada a aceder a esta rota`,
          403 // 403: Forbidden
        )
      );
    }
    next();
  };
};
