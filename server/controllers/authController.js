const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Contract = require('../models/Contract'); 
const WorkEntry = require('../models/WorkEntry');
const Vacation = require('../models/vacation');

const generateUserResponse = (user) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    position: user.position,
    phone: user.phone,
    address: user.address,
    googleId: user.googleId
  };
};

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
      res.json({ token, user: generateUserResponse(user) });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

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
      res.json({ token, user: generateUserResponse(user) });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};


exports.googleLogin = async (req, res) => {
  const { name, email, googleId, photo } = req.body; 

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name,
        email,
        password: hashedPassword,
        googleId,
        photo: photo || "" 
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
        res.json({ token, user: generateUserResponse(user) });
      }
    );

  } catch (err) {
    console.error("Error en Google Login:", err.message);
    res.status(500).send('Error del servidor al conectar con Google');
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { name, position, phone, address, photo } = req.body;
    const profileFields = {};
    if (name) profileFields.name = name;
    if (position) profileFields.position = position;
    if (phone) profileFields.phone = phone;
    if (address) profileFields.address = address;
    if (photo) profileFields.photo = photo;

    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, select: '-password' }
    );

    res.json(generateUserResponse(user)); 

  } catch (err) {
    console.error("Error al actualizar perfil:", err.message);
    res.status(500).send('Error del servidor');
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; 


    await Contract.deleteMany({ userId: userId });


    await WorkEntry.deleteMany({ userId: userId });


    await Vacation.deleteMany({ userId: userId });

    await User.findByIdAndDelete(userId);

    res.json({ msg: 'Cuenta y datos eliminados permanentemente.' });

  } catch (err) {
    console.error("Error eliminando cuenta:", err.message);
    res.status(500).send('Error del servidor al eliminar cuenta');
  }
};