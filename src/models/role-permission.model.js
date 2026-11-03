import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const rolePermission = sequelize.define(
  "RolePermission",
  {
    roleId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      field: "role_id",
    },

    permissionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      field: "permission_id",
    },
  },
  {
    tableName: "role_permissions",
    timestamps: false,
    underscored: true,
  },
);

export default rolePermission;
