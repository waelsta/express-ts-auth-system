import * as yup from 'yup';

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

interface IUser {
  phone_number: string;
  first_name: string;
  last_name: string;
  street: string;
  email: string;
  city: string;
}

export interface ISessionClientData extends IUser {
  is_client: boolean;
  createdAt: Date;
  id: string;
}

export interface ISignupFormTypes extends IUser {
  password_match: string;
  password: string;
}

export interface ISigninFormTypes {
  email: string;
  password: string;
}

export const userSignUpSchema = yup.object().shape({
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

export const userSignInSchema = yup.object().shape({
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
