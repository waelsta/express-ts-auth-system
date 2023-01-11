import { saveClientPicture, saveEmployeePicture } from '../models/imageUpload';
type saveImageFn = (clientId: string, picture: string) => Promise<boolean>;
export const uploadImageMapper = new Map<string, saveImageFn>();

uploadImageMapper
  .set('client', saveClientPicture)
  .set('employee', saveEmployeePicture);
