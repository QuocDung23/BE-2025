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

router.post("/register", (req, res) => controller.register(req, res));
router.post("/login", (req, res) => controller.login(req, res));

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

router.post("/refresh-token", controller.refreshAccessToken)


export { router as authRouter };
