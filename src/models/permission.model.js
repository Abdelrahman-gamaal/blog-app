import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const permission = sequelize.define(
  "Permission",
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
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: "permissions",
    timestamps: true,
    underscored: true,
  },
);

export default permission;
