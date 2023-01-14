import * as yup from 'yup';
import { IUser } from '../types/client';
import { IEmployee } from '../types/employee';

const cities = [
  'ariana',
  'beja',
  'ben arous',
  'bizerte',
  'gabes',
  'gafsa',
  'jendouba',
  'kairouan',
  'kasserine',
  'kebili',
  'manouba',
  'kef',
  'mahdia',
  'medenine',
  'monastir',
  'nabeul',
  'sfax',
  'sidi bouzid',
  'siliana',
  'sousse',
  'tataouine',
  'tozeur',
  'tunis',
  'zaghouan'
];

const clientSignUpSchema = yup.object().shape({
  first_name: yup.string().min(3, 'minimum length is 3').required(),
  last_name: yup.string().min(3, 'minimum length is 3').required(),
  password: yup
    .string()
    .min(8, 'minimum number of characters is 8')
    .test(
      'isValidPassword',
      'Minimum eight characters, at least one letter and one number',
      async value => {
        if (typeof value === 'string') {
          const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
          const found = passwordRegex.test(value);
          return found;
        }
        return false;
      }
    )
    .required(),
  password_match: yup
    .string()
    .oneOf([yup.ref('password')], 'your password does not match')
    .required(),
  city: yup
    .string()
    .test('invalidCity', 'please choose a city from the list', value => {
      if (typeof value === 'string') {
        return cities.includes(value.toLowerCase());
      }
      return false;
    })
    .required(),
  street: yup.string().min(3).required(),
  email: yup
    .string()
    .test('isValidEmail', 'please enter a valid email', value => {
      if (typeof value === 'string') {
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
        return emailRegex.test(value);
      }
      return false;
    })
    .required(),
  phone_number: yup
    .string()
    .min(8, 'must have 8 digits')
    .test('isValideNumber', 'please enter an 8 digits number', value => {
      const numberRegex = /^[0-9]{8}$/;
      if (typeof value === 'string') {
        return value.length === 8 && numberRegex.test(value);
      } else {
        return false;
      }
    })
    .required()
});

const EmployeeSignUpSchema = yup.object().shape({
  first_name: yup.string().min(3, 'minimum length is 3').required(),
  last_name: yup.string().min(3, 'minimum length is 3').required(),
  password: yup
    .string()
    .min(8, 'minimum number of characters is 8')
    .test(
      'isValidPassword',
      'Minimum eight characters, at least one letter and one number',
      async value => {
        if (typeof value === 'string') {
          const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
          const found = passwordRegex.test(value);
          return found;
        }
        return false;
      }
    )
    .required(),
  password_match: yup
    .string()
    .oneOf([yup.ref('password')], 'your password does not match')
    .required(),
  city: yup
    .string()
    .test('invalidCity', 'please choose a city from the list', value => {
      if (typeof value === 'string') {
        return cities.includes(value.toLowerCase());
      }
      return false;
    })
    .required(),
  email: yup
    .string()
    .test('isValidEmail', 'please enter a valid email', value => {
      if (typeof value === 'string') {
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
        return emailRegex.test(value);
      }
      return false;
    })
    .required(),
  phone_number: yup
    .string()
    .min(8, 'must have 8 digits')
    .test('isValideNumber', 'please enter an 8 digits number', value => {
      const numberRegex = /^[0-9]{8}$/;
      if (typeof value === 'string') {
        return value.length === 8 && numberRegex.test(value);
      } else {
        return false;
      }
    })
    .required(),
  profession: yup.string().min(3, 'enter a valid profession')
});

const signInSchema = yup.object().shape({
  email: yup
    .string()
    .test('isValidEmail', 'please enter a valid email', value => {
      if (typeof value === 'string') {
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
        return emailRegex.test(value);
      }
      return false;
    })
    .required(),
  password: yup
    .string()
    .min(8, 'minimum number of characters is 8')
    .test(
      'isValidPassword',
      'Minimum eight characters, at least one letter and one number',
      async value => {
        if (typeof value === 'string') {
          const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
          const found = passwordRegex.test(value);
          return found;
        }
        return false;
      }
    )
    .required()
});

// validate employee form data
export interface EmployeeFormTypes extends IEmployee {
  password_match: string;
  password: string;
  city: string;
}
export const validateEmployeeData = async (
  employeeFormData: EmployeeFormTypes
) => await EmployeeSignUpSchema.validate(employeeFormData);

// validate client form data
export interface ClientFormTypes extends IUser {
  password_match: string;
  password: string;
}

export const validateClientData = async (formData: ClientFormTypes) => {
  await clientSignUpSchema.validate(formData);
};

// validate login form data
export interface SignInFormTypes {
  email: string;
  password: string;
}

export const ValidateSignInData = async (formData: SignInFormTypes) =>
  await signInSchema.validate(formData);
