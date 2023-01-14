export interface IUser {
  phone_number: string;
  first_name: string;
  last_name: string;
  street: string;
  email: string;
  city: string;
}

export interface ClientSession extends IUser {
  is_client: boolean;
  createdAt: Date;
  id: string;
}
