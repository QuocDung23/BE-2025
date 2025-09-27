import { prisma } from "../../configs/prisma.client";

export const AuthRepository = {
  findUserByEmail: async (email: string) => {
    try {
      return await prisma.user.findUnique({ where: { email } });
    } catch (error) {
      throw error;
    }
  },

  createUser: async (
    email: string,
    password: string,
    name?: string,
    bio?: string | null,
    address?: string | null,
    avatar?: string | null,
    status?: string | null
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
        },
      });
    } catch (error) {
      throw error;
    }
  },
};