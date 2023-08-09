const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { userSchema } = require('../services/schemaValidator');
const { User } = require('../services/databaseService');
const { generateToken } = require("../services/authService")
const logger = require("../services/loggerService");


// User Registration Controller
async function registerUser(req, res) {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password } = req.body;

    // Check if the user with the same email already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this username already exists' });
    }

    // Hash the user's password before saving it to the database using Argon2id
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 19, // 19 MiB
      timeCost: 2, // 2 iterations
      parallelism: 1, // 1 degree of parallelism
    });

    const user = await User.create({ username, password: hashedPassword });

    // Don't send the password or the hashed password in the response
    user.password = undefined;

    // Generate a JWT token
    const token = generateToken(user.username);

    // Send a success message along with the user object and token
    res.json({ message: 'User created successfully', user, token });
  } catch (err) {
    logger.error('Error during registration:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

// User Login Controller
async function loginUser(req, res) {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password using Argon2id
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = generateToken(user.username);

    // Send the token in the response
    res.json({ message: 'Authentication successful', token });
  } catch (err) {
    logger.error('Error during login:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  registerUser,
  loginUser,
};
