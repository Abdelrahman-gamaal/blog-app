import AppError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import { revokedAccessToken, user } from "../models/index.js";
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  //Bearer eyJhbGciOiJIUzI1NiIs...

  // checks on header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }
  console.log(4);
  //seprate
  const token = authHeader.split(" ")[1];
  // check if access token is valid ,payload ..
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  // check if access token revoked in database
  const revokedAccess = await revokedAccessToken.findOne({
    where: {
      jti: decoded.jti,
    },
  });
  if (revokedAccess) {
    throw new AppError("Invalid or revoked access token", 401);
  }

  const existingUser = await user.findOne({
    where: {
      id: decoded.id,
    },
  });
  if (!existingUser) {
    throw new AppError("Invalid or expired access token", 401);
  }
  req.user = existingUser;
  next();
};
