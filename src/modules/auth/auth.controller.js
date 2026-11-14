import {
  signupService,
  signinService,
  refreshTokenService,
  logoutService,
  changePasswordService,
} from "./auth.service.js";
import successResponse from "../../utils/successResponse.js";

// controllers

// sign up
export const signup = async (req, res) => {
  const result = await signupService(
    req.body.name,
    req.body.email,
    req.body.password,
  );
  successResponse(res, 201, result);
};

// sign in
export const signin = async (req, res) => {
  const result = await signinService(req.body.email, req.body.password);
  successResponse(res, 200, result.message, result.data);
};

export const refresh = async (req, res) => {
  const refreshTokenValue = req.headers["x-refresh-token"];

  const result = await refreshTokenService(refreshTokenValue);

  successResponse(res, 200, result.message, result.data);
};
export const logout = async (req, res) => {
  const refreshTokenValue = req.headers["x-refresh-token"];
  console.log("user id", req.user.id);

  const result = await logoutService(
    refreshTokenValue,
    req.user.id,
    req.auth.jti,
    req.auth.exp,
  );

  successResponse(res, 200, result);
};
export const changePassword = async (req, res) => {
  const result = await changePasswordService(
    req.user.id,
    req.body.current_password,
    req.body.new_password,
  );

  successResponse(res, 200, result);
};
