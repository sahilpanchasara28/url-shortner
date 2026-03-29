const jwt = require('jsonwebtoken');
const User = require('../models/User');

const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName,
  username: user.username,
  theme: user.theme,
  totalUrls: user.totalUrls,
  totalClicks: user.totalClicks,
  createdAt: user.createdAt
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({
      email,
      password,
      fullName,
      username: email.split('@')[0]
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error logging in' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUser(user));
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Error fetching user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { fullName, theme } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        fullName,
        theme
      },
      { new: true }
    );

    res.json({
      message: 'User updated',
      user: formatUser(user)
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Error updating user' });
  }
};
