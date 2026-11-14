import e from "express";
import joi from "joi";

// sign up schema
//================================================================
export const signupSchema = joi
  .object({
    name: joi.string().min(2).max(50).required(),

    email: joi.string().trim().lowercase().email().required(),

    password: joi.string().min(8).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
  })
  .messages({
    "string.min": "{{#label}} must be at least {{#limit}} characters",
    "string.max": "{{#label}} cannot exceed {{#limit}} characters",
    "string.email": "{{#label}} must be a valid email",
    "string.empty": "{{#label}} cannot be empty",
    "any.required": "{{#label}} is required",
    "object.unknown": "{{#label}} is not allowed",
  })
  .unknown(false);
//================================================================
// sign in schema

export const signInSchema = joi
  .object({
    email: joi.string().trim().lowercase().email().required(),
    password: joi.string().min(8).required(),
  })
  .unknown(false)
  .messages({
    "string.empty": "{{#label}} is required",
    "string.min": "{{#label}} must be at least {{#limit}} characters long",
    "string.email": "Please enter a valid email address",
    "any.required": "{{#label}} is required",
    "object.unknown": "Unknown field: {{#label}}",
  });

// change password schema
//================================================================

export const changePasswordSchema = joi
  .object({
    current_password: joi.string().required(),

    new_password: joi.string().min(8).required(),

    confirm_new_password: joi
      .string()
      .valid(joi.ref("new_password"))
      .required()
      .messages({
        "any.only": "New password and confirmation do not match",
      }),
  })
  .unknown(false)
  .messages({
    "string.min": "{{#label}} must be at least {{#limit}} characters",
    "string.empty": "{{#label}} cannot be empty",
    "any.required": "{{#label}} is required",
    "object.unknown": "Unknown field: {{#label}}",
  });
