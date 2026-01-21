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
  profile?:string
  thumbnail?:string
};


export type Header ={
  _id:string;
  imageUrl:string;
  title:string
  createdAt:string
  description?:string
  favicon?:string
}