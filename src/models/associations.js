import {
  user,
  role,
  permission,
  rolePermission,
  post,
  comment,
  refreshToken,
  revokedAccessToken,
} from "./index.js";

// User <-> Role
role.hasMany(user, {
  foreignKey: "roleId",
  onDelete: "RESTRICT",
});

user.belongsTo(role, {
  foreignKey: "roleId",
});

// Role <-> Permission (Many-to-Many)
role.belongsToMany(permission, {
  through: rolePermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
});

permission.belongsToMany(role, {
  through: rolePermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
});

// User <-> Post
user.hasMany(post, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

post.belongsTo(user, {
  foreignKey: "userId",
});

// User <-> Comment
user.hasMany(comment, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

comment.belongsTo(user, {
  foreignKey: "userId",
});

// Post <-> Comment
post.hasMany(comment, {
  foreignKey: "postId",
  onDelete: "CASCADE",
});

comment.belongsTo(post, {
  foreignKey: "postId",
});

// User <-> RefreshToken
user.hasMany(refreshToken, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

refreshToken.belongsTo(user, {
  foreignKey: "userId",
});

// User <-> RevokedAccessToken
user.hasMany(revokedAccessToken, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

revokedAccessToken.belongsTo(user, {
  foreignKey: "userId",
});
