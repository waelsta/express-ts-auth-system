import prisma from '../services/prisma.connect';

export const getEmployeeData = async (employeeId: string) => {
  return await prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      password: false,
      createdAt: false,
      email: false
    }
  });
};
