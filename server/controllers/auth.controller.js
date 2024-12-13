import User from '../models/user.js';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    const user = await User.findOne({ usuario });
    if (!user || !(await user.comparePassword(contrasena))) {
      return res.status(401).json({ error: 'usuario o contraseña incorrecta' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: 'id' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { register, login };
