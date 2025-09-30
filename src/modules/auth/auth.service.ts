import { AuthRepository } from "./auth.repository";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { mailService } from "../../service/mail.service";

dotenv.config();

export class AuthService {
  async register(
    email: string,
    password: string,
    name?: string,
    bio?: string | null,
    address?: string | null,
    avatar?: string | null,
    status?: string | null
  ) {
    const existingUser = await AuthRepository.findUserByEmail(email);
    if (existingUser) throw new Error("Email đã được đăng ký");

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // tạo OTP
    const { otpCode, otpExpiresAt } = await this.sendOTP(email, name || "bạn");

    // lưu user mới vào DB (verify = false)
    await AuthRepository.createUser(
      email,
      hashedPassword,
      name,
      bio,
      address,
      avatar,
      status,
      otpCode,
      otpExpiresAt
    );

    return {
      success: true,
      message: "Vui lòng kiểm tra email để lấy mã OTP và xác thực tài khoản.",
    };
  }

  async verifyOTP(email: string, code: string) {
    const user = await AuthRepository.findUserByOTP(email, code);
    if (!user) throw new Error("Người dùng không tồn tại");

    if (!user.otpCode || user.otpCode !== code) throw new Error("Mã OTP không hợp lệ");
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) throw new Error("Mã OTP đã hết hạn");

    await AuthRepository.updateUserVerification(email, true);

    return {
      success: true,
      message: "Xác thực tài khoản thành công. Bạn có thể đăng nhập.",
      data: { email },
    };
  }

  async login(email: string, password: string, res: Response) {
    try {
      const user = await AuthRepository.findUserByEmail(email)
        if(!user) {
        throw new Error("User not found")
      }

      if (!user.password) {
        throw new Error("User password is missing");
      }
      const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
          throw new Error("Invalid Password")
        }
      
        const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" } as SignOptions
      );
      console.log("check accessToken: ", accessToken);
      

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30m" } as SignOptions
      )
      console.log("check refreshToken : ", refreshToken);


      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 60 * 1000, 
      });
      return {
        success: true,
        message: "Login successful",
        data: { user: { id: user.id, email: user.email } },
      };
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string, res: Response) {
    try {
      if (!refreshToken) throw new Error("RefreshToken không tồn tại");

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret"
      ) as { id: string; email: string };

      const user = await AuthRepository.findUserByEmail(decoded.email);
      if (!user) throw new Error("Người dùng không tồn tại");

      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" } as SignOptions
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      return {
        success: true,
        message: "Làm mới access token thành công",
      };
    } catch (error: any) {
      console.error("Lỗi khi làm mới access token:", error.message, error.stack);
      throw new Error(`Không thể làm mới access token: ${error.message}`);
    }
  }

  async sendOTP(email: string, name: string) {
    try {
      const { otpCode, otpExpiresAt } = await mailService.sendMail(
        email,
        "Mã OTP xác thực của bạn",
        "",
        { name }
      );

      console.log('OTP được tạo:', { email, otpCode, otpExpiresAt });

      return { otpCode, otpExpiresAt };
    } catch (error: any) {
      console.error("Lỗi khi gửi OTP:", error.message, error.stack);
      throw new Error(`Không thể gửi OTP: ${error.message}`);
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await AuthRepository.findUserByEmail(email);
      if (!user) throw new Error("Người dùng không tồn tại");

      const { otpCode, otpExpiresAt } = await mailService.sendMail(
        email,
        "Mã OTP để đặt lại mật khẩu",
        "",
        { name: user.name || "bạn" }
      );

      await AuthRepository.updateUserOTP(email, otpCode, otpExpiresAt);

      return {
        success: true,
        message: "OTP đã được gửi đến email của bạn để đặt lại mật khẩu.",
        data: { email, otpCode, otpExpiresAt },
      };
    } catch (error: any) {
      console.error("Lỗi khi gửi OTP quên mật khẩu:", error.message, error.stack);
      throw new Error(`Không thể gửi OTP: ${error.message}`);
    }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    try {
      const user = await AuthRepository.findUserByEmail(email);
      if (!user) throw new Error("Người dùng không tồn tại");

      if (!user.otpCode || user.otpCode !== code) throw new Error("Mã OTP không hợp lệ");
      if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) throw new Error("Mã OTP đã hết hạn");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await AuthRepository.updateUserPassword(email, hashedPassword);

      return {
        success: true,
        message: "Đặt lại mật khẩu thành công",
        data: { email },
      };
    } catch (error: any) {
      console.error("Lỗi khi đặt lại mật khẩu:", error.message, error.stack);
      throw new Error(`Không thể đặt lại mật khẩu: ${error.message}`);
    }
  }
}