import sequelize from "../config/database.js";

import { role, permission, rolePermission } from "../models/index.js";

const permissions = [
  "create_post",
  "update_own_post",
  "delete_own_post",
  "publish_post",
  "delete_any_post",
  "create_comment",
  "delete_own_comment",
  "delete_any_comment",
  "manage_users",
  "manage_roles",
];

const rolePermissionsMap = {
  user: [
    "create_post",
    "update_own_post",
    "delete_own_post",
    "create_comment",
    "delete_own_comment",
  ],

  admin: permissions,
};

async function seedInitialData() {
  try {
    await sequelize.authenticate();

    console.log("Database connected.");

    // 1. Create roles
    const [userRole] = await role.findOrCreate({
      where: { name: "user" },
      defaults: { name: "user" },
    });

    const [adminRole] = await role.findOrCreate({
      where: { name: "admin" },
      defaults: { name: "admin" },
    });

    const roles = {
      user: userRole,
      admin: adminRole,
    };

    // 2. Create permissions
    const permissionRecords = {};

    for (const permissionName of permissions) {
      const [permissionRecord] = await permission.findOrCreate({
        where: { name: permissionName },
        defaults: { name: permissionName },
      });

      permissionRecords[permissionName] = permissionRecord;
    }

    // 3. Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(
      rolePermissionsMap,
    )) {
      for (const permissionName of permissionNames) {
        await rolePermission.findOrCreate({
          where: {
            roleId: roles[roleName].id,
            permissionId: permissionRecords[permissionName].id,
          },
          defaults: {
            roleId: roles[roleName].id,
            permissionId: permissionRecords[permissionName].id,
          },
        });
      }
    }

    console.log("Roles created successfully.");
    console.log("Permissions created successfully.");
    console.log("Role permissions assigned successfully.");
  } catch (error) {
    console.error("Seeder failed:", error.message);
    console.error("Database error:", error.original?.sqlMessage);

    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

await seedInitialData();
