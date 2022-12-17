interface IEmployee {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  profession: string;
}

export interface ISessionEmployeeData extends IEmployee {
  still_employed: boolean;
  createdAt: Date;
  id: string;
}

export interface IEmployeeSignupTypes extends IEmployee {
  password_match: string;
  password: string;
  city: string;
}

export interface IEmployeeSigninTypes {
  email: string;
  password: string;
}
