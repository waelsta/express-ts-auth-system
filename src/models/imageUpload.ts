import prisma from '../utils/prisma.connect';

// upload Client Image
export const saveClientPicture = async (
  clientId: string,
  prictureName: string
): Promise<boolean> => {
  try {
    await prisma.client.update({
      data: {
        profile_picture_url: prictureName
      },
      where: { id: clientId }
    });
    return true;
  } catch (err) {
    return false;
  }
};

// upload Employee Image
export const saveEmployeePicture = async (
  clientId: string,
  prictureName: string
): Promise<boolean> => {
  try {
    await prisma.employee.update({
      data: {
        profile_picture_url: prictureName
      },
      where: { id: clientId }
    });

    return true;
  } catch (err) {
    return false;
  }
};
