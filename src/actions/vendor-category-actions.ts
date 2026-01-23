"use server"

import { GetRequestAxios, PatchRequestAxios, PostRequestAxios } from "@/api-fn/api-hook";


export interface VendorCategory {
  _id: string;
  category: string[];
  createdAt: string;
  updatedAt: string;
}

export const getVendorCategory = async () => {
  const [data, error] = await GetRequestAxios('/seo');
  return { data, error };
};

export const createVendorCategory = async (payload: { category: string[] }) => {

    console.log("payload->",payload);
  const [data, error] = await PostRequestAxios('/seo', payload);
  return { data, error };
};

export const updateVendorCategory = async (id: string, payload: { category: string[] }) => {
  const [data, error] = await PatchRequestAxios(`/seo/${id}`, payload);
  return { data, error };
};

export const deleteVendorCategory = async (id: string) => {
  const [data, error] = await GetRequestAxios(`/seo/${id}`);
  return { data, error };
};


export const GetGuestType = async (event_id: string)=>{
  const [data, error] = await GetRequestAxios<{id:string,type:string[],event_id:string}>(`/guest/get-all-guest-type?event_id=${event_id}`);
  return { data, error };
}
export const PostNewGuestType = async (payload: {type:string[],event_id:string})=>{
  const [data, error] = await PostRequestAxios(`/guest/post-guest-type`,payload);
  return { data, error };
}