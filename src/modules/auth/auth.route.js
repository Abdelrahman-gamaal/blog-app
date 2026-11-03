import { Router } from "express";
const authRouter = Router();

import { signupSchema, signInSchema } from "./auth.validation.js";
import { validate } from "../../middleware/validate.middleware.js";
import { signup, signin } from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorizedMiddleware } from "../../middleware/authorized.middleware.js";
//==============================================================

authRouter.post("/signup", validate(signupSchema), signup);
authRouter.post("/signin", validate(signInSchema), signin);

authRouter.get(
  "/test-authorization",
  authenticate,
  authorizedMiddleware("delete_post_invalid"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Authorization passed successfully",
    });
  },
);

export default authRouter;
