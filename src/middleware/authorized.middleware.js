import { permission, rolePermission } from "../models/index.js";
import AppError from "../utils/AppError.js";

export const authorizedMiddleware = (...requiredPermissions) => {
  return async (req, res, next) => {
    // check if requiredPermissions have content
    if (requiredPermissions.length === 0) {
      throw new AppError("Authorization configuration error", 500);
    }

    //// 3. Check every required permission

    for (const permissionName of requiredPermissions) {
      const existingPermission = await permission.findOne({
        where: {
          name: permissionName,
        },
      });

      if (!existingPermission) {
        throw new AppError("Authorization configuration error", 500);
      }
      const roleHasPermission = await rolePermission.findOne({
        where: {
          roleId: req.user.roleId,
          permissionId: existingPermission.id,
        },
      });

      if (!roleHasPermission) {
        throw new AppError("Forbidden", 403);
      }
    }
    next();
  };
};
