const express = require('express');
const router = express.Router();
const Password = require('../models/Password');
const auth = require('../middleware/auth');

// Get all passwords for user
router.get('/', auth, async (req, res) => {
  try {
    const passwords = await Password.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create password
router.post('/', auth, async (req, res) => {
  try {
    const { website, username, password, notes } = req.body;

    const newPassword = new Password({
      user: req.userId,
      website,
      username,
      password,
      notes
    });

    await newPassword.save();
    res.status(201).json(newPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update password
router.put('/:id', auth, async (req, res) => {
  try {
    const { website, username, password, notes } = req.body;

    let passwordDoc = await Password.findById(req.params.id);

    if (!passwordDoc) {
      return res.status(404).json({ message: 'Password not found' });
    }

    if (passwordDoc.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    passwordDoc.website = website;
    passwordDoc.username = username;
    passwordDoc.password = password;
    passwordDoc.notes = notes;

    await passwordDoc.save();
    res.json(passwordDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete password
router.delete('/:id', auth, async (req, res) => {
  try {
    const passwordDoc = await Password.findById(req.params.id);

    if (!passwordDoc) {
      return res.status(404).json({ message: 'Password not found' });
    }

    if (passwordDoc.user.toString() !== req.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Password.findByIdAndDelete(req.params.id);
    res.json({ message: 'Password deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;