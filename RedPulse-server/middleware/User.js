import { verifyToken } from "../lib/jwt.js";
import Token from "../models/Token.js";

const userMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const verified = await verifyToken(token);
    if (!verified) {
      await Token.findOneAndDelete({ token });
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    req.user = verified;
    req.token = token;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

export default userMiddleware;
