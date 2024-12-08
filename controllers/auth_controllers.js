import md5 from "md5";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";//mengakses atau mengelola data u crud

const prisma = new PrismaClient();
const secretKey = "telkom";

export const authenticate = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userCek = await prisma.user.findFirst({
      where: {
        username: username,
        password: md5(password),
      },
    });
    if (userCek) {
      const payload = { id: userCek.id, username: userCek.username };
      const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
      res.status(200).json({
        success: true,
        message: "Login berhasil",
        token: token,
      });
    } else {
      res.status(404).json({
        success: false,
        logged: false,
        message: "Username or password invalid",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const authorize = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, secretKey, (err, verifiedUser) => {
        if (err) {
          // Token tidak valid atau telah kedaluwarsa
          return res.status(401).json({
            success: false,
            auth: false,
            message: "Invalid or expired token",
          });
        }
        // Token valid
        req.user = verifiedUser;
        next();
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Authorization header is missing",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
    });
  }
};
