import { user, role, refreshToken } from "../../models/index.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";
import { generateAccessToken, genrateRefreshToken } from "../../utils/jwt.js";
import crypto from "node:crypto";

//===========================================================

// sign up

export const signupService = async (name, email, password) => {
  // check if email exist

  const existingUser = await user.findOne({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  // hashing password
  const passwordHash = await bcrypt.hash(password, 10);

  //choose the user role id
  const userRole = await role.findOne({
    where: {
      name: "user",
    },
  });
  if (!userRole) {
    throw new AppError("Registration failed due to a server error", 500);
  }
  console.log(userRole);

  await user.create({
    name: name,
    email: email,
    passwordHash: passwordHash,
    roleId: userRole.id,
  });
  return "Account created successfully. Please log in.";
};

//===========================================================

// sign in

export const signinService = async (email, password) => {
  // check if email exist
  const existingUser = await user.findOne({
    where: {
      email,
    },
    include: [
      {
        model: role,
        attributes: ["name"],
      },
    ],
  });
  if (!existingUser) {
    throw new AppError("Invalid email or password", 400);
  }
  // compare password
  const match = await bcrypt.compare(password, existingUser.passwordHash);
  if (!match) {
    throw new AppError("Invalid email or password", 400);
  }

  // genrate tokens
  const accessToken = await generateAccessToken(existingUser.id);
  const createRefreshToken = await genrateRefreshToken(existingUser.id);
  console.log(1);

  // hash refresh token
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(createRefreshToken)
    .digest("hex");
  console.log(2);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  // recorded refresh token hash
  await refreshToken.create({
    userId: existingUser.id,
    tokenHash: hashedRefreshToken,
    expiresAt: expiresAt,
  });
  console.log(3);

  return {
    message: "Signed in successfully",
    data: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.Role.name,
      tokens: {
        accessToken: accessToken,
        refreshToken: createRefreshToken,
      },
    },
  };
};

//===========================================================
