export interface IEmployee {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  profession: string | null;
}

export interface EmployeeSession extends IEmployee {
  still_employed: boolean;
  createdAt: Date;
  id: string;
}
