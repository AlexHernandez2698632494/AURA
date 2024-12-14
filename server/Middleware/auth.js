import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  try {
    // El token debe comenzar con "Bearer "
    const actualToken = token.split(' ')[1]; // Extrae el token después de "Bearer"
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded; // Guarda los datos del usuario en la solicitud
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválidos' });
  }
};
