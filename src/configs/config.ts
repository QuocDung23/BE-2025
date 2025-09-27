import dotenv from "dotenv";

dotenv.config(); // Load biến từ .env

export const config = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "default_access_secret",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "30m",
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "postgresql://root:123@localhost:5432/trip",
};