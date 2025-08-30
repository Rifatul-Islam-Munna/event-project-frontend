import { PricingPlan } from "./pricing";

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
  sub_token:string
};

export type User = {
  _id: string
  name: string;
  email: string;
  type:string
  plan?:PricingPlan
  subscription?:{endDate:string,startedDate:string}
};