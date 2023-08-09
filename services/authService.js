const jwt = require("jsonwebtoken");
const logger = require("./loggerService");
const SECRET = "JWT_SECRET_KEY"

function authenticateToken(req, res, next) {
  const token = req.header("Authorization")
  if (!token) {
    return res.status(401).json({ error: "Access denied. Missing token." });
  }

  jwt.verify(token.split(' ')[1], SECRET, (err, user) => {
    if (err) {
      logger.error(err)
      return res.status(403).json({ error: "Invalid token." });
    }
    req.user = user;
    next();
  });
}

//function to generate JWT token
function generateToken(data) {
  return jwt.sign({data}, SECRET, {
    expiresIn: "1h", // Token expiration time (1 hour)
  });
}

module.exports = { authenticateToken, generateToken };
