import { AuthRepository } from "./auth.repository";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv"
import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";

dotenv.config()

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
    try {
      const existingUser = await AuthRepository.findUserByEmail(email);
      if (existingUser) throw new Error("Email already registered");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      return AuthRepository.createUser(
        email,
        hashedPassword,
        name,
        bio,
        address,
        avatar,
        status
      );
    } catch (error: any) {
      throw error;
    }
  }

  async login(email: string, password: string, res: Response) {
    try {
      const user = await AuthRepository.findUserByEmail(email)
        if(!user) {
        throw new Error("User not found")
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

      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30m" } as SignOptions
      )

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
}
