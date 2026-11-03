import jwt from "jsonwebtoken";
import crypto from "node:crypto";

// access token
export const generateAccessToken = (userId) => {
  const token = jwt.sign(
    {
      jti: crypto.randomUUID(),
      id: userId,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    },
  );
  return token;
};

// refressh token

export const genrateRefreshToken = (userId) => {
  const token = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );
  return token;
};
