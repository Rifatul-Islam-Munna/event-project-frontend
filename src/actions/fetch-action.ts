"use server"

import { EventList, Vendor } from "@/@types/events-details";
import { DeleteAxios, GetRequestAxios, GetRequestNormal, PatchRequestAxios, PostRequestAxios } from "@/api-fn/api-hook";
import * as XLSX from 'xlsx';
import { Guest as Gu } from "@/@types/events-details";
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

  for (const r of rawRows) {
  
    const kName  = findKey(r, ['name', 'full name', 'full_name']);
    const kEmail = findKey(r, ['email', 'e-mail', 'mail']);
    const kPhone = findKey(r, ['phone', 'phone number', 'mobile', 'contact']);

    const name  = String(kName  ? r[kName]  : '').trim();
    const email = String(kEmail ? r[kEmail] : '').trim().toLowerCase();
    const phone = normalizePhone(String(kPhone ? r[kPhone] : ''));


    if (!name) continue;
    if (!email && !phone) continue;
    if (email && !looksLikeEmail(email)) continue;

    result.push({ name, email, phone,event_id: eventId });
  }

 

   const [data ,error] = await PostRequestAxios(`/guest/create-bulk-guest`,{data:result});
     console.log("result->",{data:result});
    console.log("guest-data-bulk->",data,"guest-error-bulk->",error);

    return {data,error}



}

export const uploadOneGuest =async (payload:Record<string,unknown>)=>{

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

    const [data,error] = await PostRequestAxios(`/vendor`,payload);
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