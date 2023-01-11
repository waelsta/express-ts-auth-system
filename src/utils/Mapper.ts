import { saveClientPicture, saveEmployeePicture } from '../models/imageUpload';

// list of users that will be used to map image upload
// to specific user table in database
export const users = ['client', 'employee'];
type UserTypes = typeof users[number];

type saveImageFn = (userId: string, picture: string) => Promise<boolean>;

export const uploadImageMapper = new Map<UserTypes, saveImageFn>();

uploadImageMapper
  .set('client', saveClientPicture)
  .set('employee', saveEmployeePicture);
