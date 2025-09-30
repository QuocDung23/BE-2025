import { prisma } from "../../configs/prisma.client";

export const AuthRepository = {
  findUserByEmail: async (email: string) => {
    try {
      return await prisma.user.findUnique({ where: { email } });
    } catch (error: any) {
      console.error("Lỗi khi tìm user theo email:", error.message);
      throw new Error(`Không thể tìm user: ${error.message}`);
    }
  },

  createUser: async (
    email: string,
    password: string,
    name?: string,
    bio?: string | null,
    address?: string | null,
    avatar?: string | null,
    status?: string | null,
    otpCode?: string,
    otpExpiresAt?: Date
  ) => {
    try {
      return await prisma.user.create({
        data: {
          email,
          password,
          name: name || "User",
          bio,
          address,
          avatar,
          status,
          verify: false,
          otpCode,
          otpExpiresAt,
        },
      });
    } catch (error: any) {
      console.error("Lỗi khi tạo user:", error.message);
      throw new Error(`Không thể tạo user: ${error.message}`);
    }
  },

  async findUserByOTP(email: string, otpCode: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email,
          otpCode,
        },
      });

      if (!user) {
        throw new Error("Không tìm thấy người dùng với OTP này");
      }

      return user;
    } catch (error: any) {
      console.error("❌ Lỗi khi lấy user theo OTP:", error.message, error.stack);
      throw new Error(`Không thể lấy user theo OTP: ${error.message}`);
    }
  },

  updateUserOTP: async (email: string, otpCode: string, otpExpiresAt: Date) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { otpCode, otpExpiresAt },
      });
      console.log("Cập nhật OTP cho user:", { email, otpCode, otpExpiresAt });
      return updatedUser;
    } catch (error: any) {
      console.error("Lỗi khi cập nhật OTP:", error.message);
      throw new Error(`Không thể cập nhật OTP: ${error.message}`);
    }
  },

  updateUserVerification: async (email: string, verify: boolean) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          verify,
          otpCode: null,
          otpExpiresAt: null,
        },
      });
      console.log("Cập nhật trạng thái verify:", { email, verify });
      return updatedUser;
    } catch (error: any) {
      console.error("Lỗi khi cập nhật verify:", error.message);
      throw new Error(`Không thể cập nhật verify: ${error.message}`);
    }
  },

  updateUserPassword: async (email: string, password: string) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password,
          otpCode: null,
          otpExpiresAt: null,
        },
      });
      console.log("Cập nhật mật khẩu thành công cho:", email);
      return updatedUser;
    } catch (error: any) {
      console.error("Lỗi khi cập nhật mật khẩu:", error.message);
      throw new Error(`Không thể cập nhật mật khẩu: ${error.message}`);
    }
  },
};
