import { signupService, signinService } from "./auth.service.js";
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
