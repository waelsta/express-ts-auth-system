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
