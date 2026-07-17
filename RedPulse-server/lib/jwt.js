import jwt from "jsonwebtoken";

const generateToken = (payload) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d"; // Token expiration time
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return false;
  }
};

export { generateToken, verifyToken };
