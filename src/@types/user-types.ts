export interface fetchError{
 message: string;  statusCode: number 
}

export type LoginResponse = {
  data: {
    _id: string
    name: string;
    email: string;
    type:string
  };
  access_token: string;
};

export type User = {
  _id: string
  name: string;
  email: string;
  type:string
};