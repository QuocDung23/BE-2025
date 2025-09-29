import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ServiceResponse, ResponseStatus } from "@/common";
import { StatusCodes } from "http-status-codes";
import { success } from "zod";
import { error } from "console";
import { da } from "zod/v4/locales";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, bio, address, avatar, status } = req.body;
      const user = await authService.register(
        email,
        password,
        name,
        bio,
        address,
        avatar,
        status
      );

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password} = req.body;
      const result = await authService.login(email, password, res)

      return res.status(200).json({
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        data: null
      })
    }
  }

  async refreshAccessToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, error: "Không tìm thấy refresh token" });
      }
      const result = await authService.refreshAccessToken(refreshToken, res);
      return res.status(200).json({
        success: true,
        message: result,
        data: result,
      });
    } catch (error: any) {
      console.error("Lỗi trong refreshAccessToken:", error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.message || "Đã xảy ra lỗi khi cấp lại access token" 
      });
    }
  }
}
