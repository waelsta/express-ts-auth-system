import prisma from '../services/prisma.connect';

export const getUserData = async (clientId: string) => {
  return await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      password: false,
      createdAt: false,
      email: false
    }
  });
};
