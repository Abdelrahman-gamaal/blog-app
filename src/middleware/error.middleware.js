import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const { JsonWebTokenError, TokenExpiredError, NotBeforeError } = jwt;

function errorMiddleware(err, req, res, next) {
  const isMalformedJson = err.type === "entity.parse.failed";

  const isJwtError = err instanceof JsonWebTokenError;

  const isOperational =
    err.isOperational === true || isMalformedJson || isJwtError;

  let statusCode = 500;
  let message = "Internal Server Error";

  // 1. Invalid JSON payload
  if (isMalformedJson) {
    statusCode = 400;
    message = "Invalid JSON payload";
  }

  // 2. Expired JWT
  else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  }

  // 3. JWT used before its activation time
  else if (err instanceof NotBeforeError) {
    statusCode = 401;
    message = "Token not active";
  }

  // 4. Other JWT errors
  else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  }

  // 5. Operational errors (AppError)
  else if (err.isOperational === true) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 6. Unexpected errors
  if (!isOperational) {
    console.error("Unexpected Error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
}

export default errorMiddleware;
