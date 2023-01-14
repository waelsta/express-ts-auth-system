import { Client, Employee } from '@prisma/client';
import {
  validateClientData,
  validateEmployeeData,
  ValidateSignInData
} from './validation';
import { saveEmployeePicture, saveClientPicture } from '../models/imageUpload';

// ***** client methods ****** //
import {
  createClient,
  findClientByEmail,
  saveClientSession,
  updateClientPassword,
  findClientByphoneNum
} from '../models/clientAuthModel';

// ***** employee methods ****** //
import {
  createEmployee,
  findEmployeeByEmail,
  saveEmployeeSession,
  updateEmployeePassword,
  findEmployeeByPhoneNum
} from '../models/employeeAuthModel';

type MaybeUser = Employee | Client | null;
export type UserTypes = typeof users[number];
type ValidateSignInFn = typeof ValidateSignInData;
export const users = ['client', 'employee'] as const;
type ValidateDataFn = typeof validateClientData | typeof validateEmployeeData;

export const userTypeIsMissing = (userRole: UserTypes) =>
  !userRole || !users.includes(userRole);

// type declarations for shared methods between multiple users
export interface userHelpers {
  validateUserData: ValidateDataFn;
  validateSignInData: ValidateSignInFn;
  findUserByEmail: (email: string) => Promise<MaybeUser>;
  phoneNumberExists: (number: number) => Promise<MaybeUser>;
  updateUserPassword: (email: string, pwd: string) => Promise<MaybeUser>;
  uploadUserPicture: (userId: string, picture: string) => Promise<boolean>;
  createUser: (user: UserTypes) => typeof createClient | typeof createEmployee;
  createUserSession: typeof saveClientSession | typeof saveEmployeeSession;
}

export const userMapper = new Map<UserTypes, userHelpers>();

// ***** client mappings ****** //
const saveUserToDb = (user: UserTypes) =>
  user === 'client' ? createClient : createEmployee;

userMapper.set('client', {
  createUser: saveUserToDb,
  createUserSession: saveClientSession,
  findUserByEmail: findClientByEmail,
  uploadUserPicture: saveClientPicture,
  validateUserData: validateClientData,
  validateSignInData: ValidateSignInData,
  phoneNumberExists: findClientByphoneNum,
  updateUserPassword: updateClientPassword
});

// ***** client mappings ****** //
userMapper.set('employee', {
  createUser: saveUserToDb,
  createUserSession: saveEmployeeSession,
  findUserByEmail: findEmployeeByEmail,
  uploadUserPicture: saveEmployeePicture,
  validateUserData: validateEmployeeData,
  validateSignInData: ValidateSignInData,
  phoneNumberExists: findEmployeeByPhoneNum,
  updateUserPassword: updateEmployeePassword
});
