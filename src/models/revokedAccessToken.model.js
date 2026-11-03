import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const revokedAccessToken = sequelize.define(
  "RevokedAccessToken",
  {
    jti: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      allowNull: false,
    },

    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "user_id",
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
  },
  {
    tableName: "revoked_access_tokens",
    timestamps: true,
    underscored: true,
  },
);

export default revokedAccessToken;
