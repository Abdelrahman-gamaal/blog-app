import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isIn: [["user", "admin"]],
      },
    },
  },
  {
    tableName: "roles",
    timestamps: false,
  },
);

export default role;
