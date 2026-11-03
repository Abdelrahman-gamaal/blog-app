import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const comment = sequelize.define(
  "Comment",
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
      references: {
        model: "users",
        key: "id",
      },
    },

    postId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "post_id",
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: "comments",
    timestamps: true,
    underscored: true,
  },
);

export default comment;
