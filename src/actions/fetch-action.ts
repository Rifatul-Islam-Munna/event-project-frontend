"use server"

import { EventList, Vendor } from "@/@types/events-details";
import { DeleteAxios, GetRequestAxios, GetRequestNormal, PatchRequestAxios, PostRequestAxios } from "@/api-fn/api-hook";
import * as XLSX from 'xlsx';
import { Guest as Gu } from "@/@types/events-details";
import { SubscriptionFilters, SubscriptionResponse, User } from "@/@types/admin";
import { getToken, getUserInfo } from "./auth";
import { PricingPlan } from "@/@types/pricing";
import { cookies } from "next/headers";
import { Header } from "@/@types/user-types";
import Stripe from 'stripe';
export const postEvent = async (from:FormData)=>{
     
        const [data,error]  = await PostRequestAxios(`/events`,from);

        console.log("data->",data,"error->",error);
    
        return {data,error}
  

}
export const updateEvent = async (from:FormData)=>{
     
        const [data,error]  = await PatchRequestAxios(`/events/update-events`,from);

        console.log("data->",data,"error->",error);
    
        return {data,error}
  

}


export const getAllEvent = async (page:number,limit:number)=>{
    const [data,error] = await GetRequestNormal<EventList>(`/events/get-all-event?limit=${limit}&page=${page}`);
    console.log("event-data->",data,"event-error->",error);
    return {data,error}

}

export const deleteEvent = async (id:string)=>{
    const [data,error] = await DeleteAxios(`/events/delete-document?mongoId=${id}`);
    console.log("event--de;ete->",data,"event-de;ete-->",error);
    return {data,error}

}


export type Guest = {
  name: string;
  email: string;
  phone: string;
  event_id?:string
  adults?:number
  children?:number
};

type AnyRow = Record<string, unknown>;


function findKey(row: AnyRow, candidates: string[]) {
  const norm = (s: string) => s.toLowerCase().replace(/[\s_]+/g, '');
  const keys = Object.keys(row);
  const table = new Map(keys.map(k => [norm(k), k]));
  for (const c of candidates) {
    const hit = table.get(norm(c));
    if (hit) return hit;
  }
  return null;
}

function normalizePhone(input: string) {

  const s = String(input ?? '').trim();
  const digits = s.replace(/[^\d+]/g, '');
  return digits;
}

function looksLikeEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));
}

export async function updateMultipleGuest(file: File, eventId: string) {
  
  const buffer = Buffer.from(await file.arrayBuffer());

  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // Parse to objects using header row
  const rawRows = XLSX.utils.sheet_to_json<AnyRow>(ws, {
    defval: '',  
    raw: false,  
  });

  const result: Guest[] = [];
  function getNumberValue(row: RawRow, key: string | null): number {
  if (!key) return 0;
  const value = row[key];
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

  for (const r of rawRows) {
  
    const kName  = findKey(r, ['name', 'full name', 'full_name']);
    const kEmail = findKey(r, ['email', 'e-mail', 'mail']);
    const kPhone = findKey(r, ['phone', 'phone number', 'mobile', 'contact']);
    const kaduls = findKey(r, ['adults', 'ADULTS', 'adult', 'adult count']);
    const kchild = findKey(r, ['children', 'child', '', 'adult count']);

    const name  = String(kName  ? r[kName]  : '').trim();
  
    const email = String(kEmail ? r[kEmail] : '').trim().toLowerCase();
    const phone = normalizePhone(String(kPhone ? r[kPhone] : ''));
    const adults = getNumberValue(r, kaduls);
  const children = getNumberValue(r, kchild);

    if (!name) continue;
    if (!email && !phone) continue;
    if (email && !looksLikeEmail(email)) continue;

    result.push({ name, email, phone,adults,children,event_id: eventId });
  }

 

   const [data ,error] = await PostRequestAxios(`/guest/create-bulk-guest`,{data:result});
     console.log("result->",{data:result});
    console.log("guest-data-bulk->",data,"guest-error-bulk->",error);

    return {data,error}



}

export const uploadOneGuest =async (payload:Record<string,unknown>)=>{
  console.log("payload->",payload);
  

    const [data,error] = await PostRequestAxios(`/guest/create-one-guest`,payload);
    console.log("guest-data->",data,"guest-error->",error);
    return {data,error}
    
}


export const getAllGuest= async (id:string) =>{

    const [data,error] = await GetRequestNormal<Gu[]>(`/guest/get-all-guest?event_id=${id}`);
    console.log("guest-data->",data,"guest-error->",error);
    return {data,error}
}


export const updateGuest = async (payload:Gu)=>{

     const [data,error] = await PatchRequestAxios(`/guest/update-guest`,payload);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}

export const deleteGuest = async (id:string)=>{
      const [data,error] = await DeleteAxios(`/guest/delete-guest?mongoId=${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}
export const postVendor  = async (payload:Record<string,unknown>)=>{
   const user = await getUserInfo();

  const dataofPayload ={
    ...payload,
    ...(user?.plan?.permissions?.includes("email.send") && {isEmail:true}),
    ...(user?.plan?.permissions?.includes("whatsapp.send") && {isWhatsapp:true}),
    ...(user?.plan?.permissions?.includes("message.send") && {isMessage:true}),


  }

    const [data,error] = await PostRequestAxios(`/vendor`,dataofPayload);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}

export const updateVendor  = async (payload:Record<string,unknown>)=>{
    const [data,error] = await PatchRequestAxios(`/vendor/update-vendor`,payload);
    console.log("vendor-data-update->",data,"vendor-error-update->",error);
    return {data,error}
}
export const deleteVendor = async (id:string)=>{
     const [data,error] = await DeleteAxios(`/vendor/delete-vendor?id=${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}

export const getAllVendor = async (id:string) =>{
  const [data,error] = await GetRequestNormal<Vendor[]>(`/vendor/get-all-vender?event_id=${id}`);
    console.log("guest-data->",data,"guest-error->",error);
    return {data,error}
}

//seat plan
export const updateBulkGuest = async (result:Guest[])=>{
       console.log("updated-guest-data->",{data:result});
  
   const [data ,error] = await PatchRequestAxios(`/guest/update-bulk-guest`,{data:result});

   /*  console.log("guest-data-bulk->",data,"guest-error-bulk->",error); */

    return {data,error}
}

export const updateSeatPlan = async (payload:Record<string,unknown>)=>{
   console.log("seat-plan-data->",{data:payload});
    const [data ,error] = await PatchRequestAxios(`/seat-plan/update-seat`,{data:payload});
    
   /*  console.log("guest-data-bulk->",data,"guest-error-bulk->",error); */

    return {data,error}
}

export const getAllSeatPlan = async (eventId:string)=>{
      const [data,error] = await GetRequestNormal<Record<string,unknown>[]>(`/seat-plan?event_id=${eventId}`);
    console.log("guest-data->",data,"guest-error->",error);
    return {data,error}

}


export const deleteSeatPlan = async (id:string)=>{
     const [data,error] = await DeleteAxios(`/seat-plan/delete-seat?id=${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}


export const postSeatPlan  = async (payload:Record<string,unknown>)=>{

    const [data,error] = await PostRequestAxios(`/seat-plan`,payload);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}


export const getSubScribeDataAdmin =  async(quert:string)=>{
  

  const [data,error] = await GetRequestNormal<SubscriptionResponse>(`/subscription/admin-pagination?${quert}`);
    console.log("guest-data->",data,"guest-error->",error);
    return {data,error}
}

export const updateSubScribe = async (payload:Record<string,unknown>)=>{
     console.log("seat-plan-data->",{data:payload});
    const [data ,error] = await PatchRequestAxios(`/subscription/update-sub`,payload);
    

    return {data,error}
}

export const deleteSubScribe = async (id:string) =>{
    const [data,error] = await DeleteAxios(`/subscription/delete-sub?id=${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}

export const subScript = async (sub:string)=>{
  const user  = await getUserInfo();
  const payload = {userId:user?._id,subscriptionType:sub}
   const [data,error] = await PostRequestAxios(`/subscription/create-sub`,payload);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}
 
interface AuthResponse {
  success: boolean;
  user: User;
  access_token: string;
  subToken: string;
}

export const getSubTokenFirst = async (sub:string)=>{
  const [data,error] = await GetRequestNormal<AuthResponse>(`/subscription/create-payment?paymentIntentId=${sub}`);
   if(data?.success){
     const coookies = await cookies();
       coookies.set("access_token",data?.access_token,{maxAge:60*60*24,path:'/',httpOnly:true});
      coookies.set("user_info",JSON.stringify(data?.user),{maxAge:60*60*24,path:'/',httpOnly:true})
      coookies.set("sub_token",data?.subToken,{maxAge:60*60*24,path:'/',httpOnly:true})
   }
   const r = {success:true}
  
  return {r,error}

}

export const getAllThePlans = async ()=>{
  const [data,error] = await GetRequestNormal<PricingPlan[]>(`/subscription/find-all-plans`);
  return {data,error}
}

export const createPlan =  async(payload:Record<string,unknown>)=>{
    const [data,error] = await PostRequestAxios(`/subscription/create-plan`,payload);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}

export const deletePlan = async (id:string) =>{
    const [data,error] = await DeleteAxios(`/subscription/delete-plans?id=${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}

export const updatePlans = async ( id:string,payload:Record<string,unknown>)=>{
     console.log("seat-plan-data->",{data:payload});
    const [data ,error] = await PatchRequestAxios(`/subscription/update-plans?id=${id}`,payload);
    

    return {data,error}
}


export const getHeader = async ()=>{
  const [data,error] = await GetRequestNormal<Header>(`/header/get-one`);
  return {data,error}
}

export const postHeader = async (payload:FormData)=>{
      const [data,error] = await PostRequestAxios(`/header`,payload);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}

export const DeleteHeader = async (id:string) =>{
    const [data,error] = await DeleteAxios(`/header/${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}
interface User {
  _id: string;
  type: "user";
  name: string;
  email: string;
  password: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
  plan?: string; // optional because not all users have it
  subscription?: string; // optional as well
}

interface PaginatedUsersResponse {
  data: User[];
  totalPages: number;
  totalDocs: number;
  currentPage: number;
}

export const getAllUser = async (page:number,limit:number)=>{
  const [data,error] = await GetRequestNormal<PaginatedUsersResponse>(`/user/get-all-user?limit=${limit}&page=${page}`);
  return {data,error}
}

export const postAdminSub = async (payload:Record<string,unknown>)=>{
      const [data,error] = await PostRequestAxios(`/subscription/subscription-admin`,payload);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}

export const deleteUSer = async (id:string) =>{
    const [data,error] = await DeleteAxios(`/user/delete-user?id=${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}


 const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function prepareBilling() {
  const user = await getUserInfo();             // { _id, email, name }
  const mongoId = user._id;

  // Find or create Stripe Customer linked to mongoId
  const search = await stripe.customers.search({
    query: `metadata['app_user_id']:'${mongoId}'`,
    limit: 1,
  });
  const customer =
    search.data[0] ??
    (await stripe.customers.create({
      email: user.email,
      name:  user.name,
      metadata: { app_user_id: mongoId },
    }));

  const si = await stripe.setupIntents.create({
    customer: customer.id,
    usage:   'off_session',
    payment_method_types: ['card'],
  });

  return {                              
    clientSecret: si.client_secret!,  
  };
}


export const postVanuSize = async (payload:Record<string,unknown>)=>{
    const [data,error] = await PostRequestAxios(`/vanu-size`,payload);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}
interface VenueConfigDB {
  _id:string
  venue_id: string;
  venue_dimensions: {
    width_meters: number;
    height_meters: number;
    scale_factor: number;
  };
  venue_shape: {
    vertices: Point[]; // This changes when user drags vertices
  };
  background_image: {
    image_url: string | null; // This changes when user selects different image
    position: {
      x: number; // This changes when user drags image
      y: number; // This changes when user drags image
    };
    dimensions: {
      width: number; // This changes when user resizes image
      height: number; // This changes when user resizes image
    };
  };
}
export const getVanuSize = async (venueId:string)=>{
  const [data,error] = await GetRequestNormal<VenueConfigDB>(`/vanu-size/vanu?venue_id=${venueId}`);
  console.log("vanue-data->",data,"vanue-error->",error);
  return {data,error}
}


export const postDecorator = async (payload:Record<string,unknown>)=>{
    const [data,error] = await PostRequestAxios(`/decorator`,payload);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}
 type DecoratorDB = Array<{
    // Add this new array
    id: string;
    type: string;
    event_id: string;
    position: { x: number; y: number };
    data: {
      label: string;
      imageUrl: string;
      width: number;
      height: number;
      category: string;
    };
  }>;
export const getDecorator = async (venueId:string)=>{
  const [data,error] = await GetRequestNormal<DecoratorDB>(`/decorator/get-all-decorator?id=${venueId}`);
  console.log("decorator-data->",data,"decorator-error->",error);
  return {data,error}
}

export const updateDecorator = async (payload:Record<string,unknown>[])=>{
    const [data,error] = await PatchRequestAxios(`/decorator/update`,{data:payload});
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}

export const deleteDecorator = async (id:string) =>{
    const [data,error] = await DeleteAxios(`/decorator/delete?id=${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}



export const postImages = async (FormData:FormData)=>{
    const [data,error] = await PostRequestAxios(`/images`,FormData);
    console.log("vendor-data->",data,"vendor-error->",error);
    return {data,error}
}
type images ={
  _id:string,
  imageUrl:string,

}
export const getAllImages  =async () =>{
  const [data,error] = await GetRequestNormal<images[]>(`/images`);
    console.log("guest-data->",data,"guest-error->",error);
    return {data,error}
}

export const deleteImages = async (id:string) =>{
    const [data,error] = await DeleteAxios(`/images/${id}`);
    console.log("guest-data-update->",data,"guest-error-update->",error);
    return {data,error}
}