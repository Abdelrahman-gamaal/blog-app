import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const user = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },

    roleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "role_id",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

export default user;
