import {
  user,
  role,
  refreshToken,
  revokedAccessToken,
} from "../../models/index.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcrypt";
import { generateAccessToken, genrateRefreshToken } from "../../utils/jwt.js";
import crypto, { hash } from "node:crypto";
import jwt from "jsonwebtoken";
import sequelize from "../../config/database.js";
import { Op } from "sequelize";
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
//=================================================================
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
  const familyId = crypto.randomUUID();
  // recorded refresh token hash
  await refreshToken.create({
    userId: existingUser.id,
    tokenHash: hashedRefreshToken,
    familyId,
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
//=================================================================
//===========================================================

//refresh refreshtoken and access token

export const refreshTokenService = async (rfreshToken) => {
  // 1. Verify Refresh Token

  if (!rfreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const decoded = jwt.verify(rfreshToken, process.env.JWT_REFRESH_SECRET);

  // 2. Hash Refresh Token
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(rfreshToken)
    .digest("hex");

  let reuseDetected = false;
  let result;

  // 3. Start Transaction
  await sequelize.transaction(async (transaction) => {
    // Search + Row Lock
    const refreshTokenExist = await refreshToken.findOne({
      where: {
        tokenHash: hashedRefreshToken,
        userId: decoded.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // 4. Token Not Found
    if (!refreshTokenExist) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // 5. Reuse Detection
    if (refreshTokenExist.revokedAt !== null) {
      await refreshToken.update(
        {
          revokedAt: new Date(),
        },
        {
          where: {
            familyId: refreshTokenExist.familyId,
            revokedAt: null,
          },
          transaction,
        },
      );

      reuseDetected = true;
      return;
    }

    // 6. Expiration Check
    if (refreshTokenExist.expiresAt <= new Date()) {
      throw new AppError("Refresh token expired", 401);
    }

    // 7. Revoke Old Refresh Token
    await refreshTokenExist.update(
      {
        revokedAt: new Date(),
      },
      { transaction },
    );

    // 8. Generate New Tokens
    const newAccessToken = generateAccessToken(refreshTokenExist.userId);

    const newRefreshToken = genrateRefreshToken(refreshTokenExist.userId);

    // 9. Hash New Refresh Token
    const hashedNewRefreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    // 10. Set New Expiration Date
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 11. Store New Refresh Token
    await refreshToken.create(
      {
        userId: refreshTokenExist.userId,
        familyId: refreshTokenExist.familyId,
        tokenHash: hashedNewRefreshToken,
        expiresAt,
      },
      { transaction },
    );

    // 12. Prepare Response
    result = {
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        rfreshToken: newRefreshToken,
      },
    };
  });

  // 13. Reject Reused Token After Commit
  if (reuseDetected) {
    throw new AppError("Refresh token reuse detected", 401);
  }

  // 14. Return New Tokens
  return result;
};

//=================================================================
//=================================================================

export const logoutService = async (
  rfreshToken,
  userId,
  accessTokenJti,
  accessTokenExp,
) => {
  // check if rfresh token is sent
  if (!rfreshToken) {
    throw new AppError("Refresh token is required", 401);
  }
  const decoded = jwt.verify(rfreshToken, process.env.JWT_REFRESH_SECRET);
  // 2. Hash Refresh Token

  if (decoded.id !== userId) {
    throw new AppError("Invalid refresh token", 401);
  }

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(rfreshToken)
    .digest("hex");

  return await sequelize.transaction(async (transaction) => {
    const refreshTokenRecord = await refreshToken.findOne({
      where: {
        tokenHash: hashedRefreshToken,
        userId,
        revokedAt: null,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!refreshTokenRecord) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // 2. Revoke Refresh Token
    await refreshTokenRecord.update(
      {
        revokedAt: new Date(),
      },
      { transaction },
    );
    // 3. Revoke Access Token
    await revokedAccessToken.create(
      {
        jti: accessTokenJti,
        userId,
        expiresAt: new Date(accessTokenExp * 1000),
      },
      { transaction },
    );
    return "Logged out successfully";
  });
};

//============================================================================
export const changePasswordService = async (
  userId,
  currentPassword,
  newPassword,
) => {
  // check if current password is correct
  const isCorrect = await bcrypt.compare(currentPassword, hashedPassword);
  if (!isCorrect) {
    throw new AppError("Current password is incorrect", 400);
  }
  // check if user dosnt enter the same password
  if (currentPassword === newPassword) {
    throw new AppError("New password must be different", 400);
  }
  //hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await sequelize.transaction(async (transaction) => {
    // Step 1: Lock user row
    const userRecord = await user.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // Step 2: Check user existence
    if (!userRecord) {
      throw new AppError("User not found", 404);
    }

    // Step 3: Update password
    await userRecord.update(
      {
        passwordHash: hashedNewPassword,
      },
      { transaction },
    );

    // Step 4: Revoke all active refresh tokens
    await refreshToken.update(
      {
        revokedAt: new Date(),
      },
      {
        where: {
          userId,
          revokedAt: null,
        },
        transaction,
      },
    );
  }); // Automatic COMMIT or ROLLBACK

  return "Password changed successfully";
};
