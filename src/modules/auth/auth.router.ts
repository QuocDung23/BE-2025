import express, { Router } from "express";
import { AuthController } from "./auth.controller";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { email, z } from "zod";
import { createApiResponse } from "../../swagger/openAPIResponseBuilders";
import passport from "@/configs/passport";

export const authRegistry = new OpenAPIRegistry();

const router: Router = express.Router();
const controller = new AuthController();

const UserRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  bio: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
  }),
});

const AuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const SendOTPSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});
const VerifyOTPSchema = z.object({
  email: z.string().email(),
  optCode: z.string().length(6),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
const ResetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Authentication"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserRegisterSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    AuthResponseSchema,
    "User registered successfully"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Authentication"],
  summary: " Login a user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthLoginSchema,
        },
      },
    },
  },
  responses: createApiResponse(AuthResponseSchema, "Login successful"),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/sendOTP",
  tags: ["Authentication"],
  summary: "Send OPT to mail",
  request: {
    body: {
      content: {
        'application/json' : {
          schema: SendOTPSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.object({ email: z.string(), expiresIn: z.number() }).optional(),
    }),
    "OTP send success"
  ),
});
authRegistry.registerPath({
  method: "post",
  path: "/auth/verify-otp",
  tags: ["Authentication"],
  summary: "authentication OTP",
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyOTPSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      success: z.boolean(),
      message: z.string(),
    }),
    "OTP successful authentication"
  ),
});

authRegistry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  tags: ["Authentication"],
  summary: "Send OTP for forgot password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ForgotPasswordSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.object({ email: z.string(), otpCode: z.string(), otpExpiresAt: z.string().datetime() }).optional(),
    }),
    "OTP for forgot password sent successfully"
  ),
});
authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Authentication"],
  summary: "Reset password using OTP",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResetPasswordSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.object({ email: z.string() }).optional(),
    }),
    "Password reset successfully"
  ),
});



router.post("/register", (req, res) => controller.register(req, res));
router.post("/login", (req, res) => controller.login(req, res));

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

router.post("/send-otp", (req, res) => controller.sendOTP(req, res));
router.post("/verify-otp", (req, res) => controller.verifyOTP(req, res));

router.post("/forgot-password", (req, res) => controller.forgotPassword(req, res));
router.post("/reset-password", (req, res) => controller.resetPassword(req, res));

router.post("/refresh-token", controller.refreshAccessToken)


export { router as authRouter };
