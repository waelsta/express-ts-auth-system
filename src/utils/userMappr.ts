import { ClientSession } from '../types/client';
import { Client, Employee } from '@prisma/client';
import { EmployeeSession } from '../types/employee';
import { validateClientData, validateEmployeeData } from './validation';
import { saveEmployeePicture, saveClientPicture } from '../models/imageUpload';

// ***** client methods ****** //
import {
  findClientByEmail,
  saveClientSession,
  updateClientPassword
} from '../models/client/authModels';

// ***** employee methods ****** //
import {
  findEmployeeByEmail,
  saveEmployeeSession,
  updateEmployeePassword
} from '../models/employee/authModel';

export const users = ['client', 'employee'] as const;
export type UserTypes = typeof users[number];
type MaybeUser = Employee | Client | null;
type ValidateDataFn = typeof validateClientData | typeof validateEmployeeData;

// type declarations for shared methods between multiple users
export interface userHelpers {
  validateUserData: ValidateDataFn;
  findUserByEmail: (email: string) => Promise<MaybeUser>;
  updateUserPassword: (email: string, pwd: string) => Promise<MaybeUser>;
  uploadUserPicture: (userId: string, picture: string) => Promise<boolean>;
  saveUserSession: (user: ClientSession & EmployeeSession) => Promise<string>;
}

export const userMapper = new Map<UserTypes, userHelpers>();

// ***** client mappings ****** //

userMapper.set('client', {
  findUserByEmail: findClientByEmail,
  saveUserSession: saveClientSession,
  uploadUserPicture: saveClientPicture,
  validateUserData: validateClientData,
  updateUserPassword: updateClientPassword
});

// ***** client mappings ****** //
userMapper.set('employee', {
  findUserByEmail: findEmployeeByEmail,
  saveUserSession: saveEmployeeSession,
  uploadUserPicture: saveEmployeePicture,
  validateUserData: validateEmployeeData,
  updateUserPassword: updateEmployeePassword
});
