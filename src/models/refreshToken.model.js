import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const refreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "user_id",
    },

    tokenHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: "token_hash",
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },

    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "revoked_at",
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
    underscored: true,
  },
);

export default refreshToken;
