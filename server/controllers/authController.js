const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRO
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// 2. LOGIN MANUAL
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// 3. LOGIN CON GOOGLE (La función que te faltaba o fallaba)
exports.googleLogin = async (req, res) => {
  const { name, email, googleId } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // Usuario existe: actualizamos ID y entramos
      user.googleId = googleId;
      await user.save();
    } else {
      // Usuario nuevo: lo creamos
      const randomPassword = Math.random().toString(36).slice(-8); 
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
        googleId
      });
      await user.save();
    }

    const payload = { user: { id: user.id } };
    
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: '5h' }, 
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { id: user.id, name: user.name, email: user.email } 
        });
      }
    );

  } catch (err) {
    console.error("Error en Google Login:", err.message);
    res.status(500).send('Error del servidor');
  }
};

// Actualizar Perfil (Update)
exports.updateProfile = async (req, res) => {
  try {
    // Buscamos por ID y actualizamos. {new: true} devuelve el usuario ya cambiado.
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body }, // Actualiza solo los campos que enviemos
      { new: true, select: '-password' } // No devolvemos la contraseña
    );
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error al actualizar perfil');
  }
};