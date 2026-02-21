"use server"

import { DeleteAxios, GetRequestAxios, GetRequestNormal, PatchRequestAxios, PostRequestAxios } from "@/api-fn/api-hook";


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
export type MessageSend = {
  _id: string;
  event_id: string;
  numberOFSendMessageLimit?: number;
  startingDate?: string | Date;
  numberOfNotSend: {
    sms: number;
    mail: number;
    whatsapp: number;
  };
  isMessageSend: boolean;
};
export const getMessageService = async (event_id:string)=>{
  const [data, error] = await GetRequestNormal<MessageSend>(`/seat-plan/get-one-message-send?id=${event_id}`);

  console.log("search-data->",data,"search-error->",error);
  return { data, error };
}
export const updateMessageService = async (event_id: string, startingDate: string) => {
  const [data, error] = await PatchRequestAxios<MessageSend>(
    `/seat-plan/update-date`,
    { date: startingDate, event_id: event_id }
  );
  return { data, error };
};


// ─── Coupon Action Functions ───────────────────────────────────────────────

export const getAllCoupons = async (page: number = 1, limit: number = 10) => {
  const [data, error] = await GetRequestNormal<any>(
    `/coupons?page=${page}&limit=${limit}`
  );
  return { data, error };
};

export const createCoupon = async (payload: Record<string, unknown>) => {
  const [data, error] = await PostRequestAxios<any>(`/coupons`, payload);
  return { data, error };
};


export const updateCoupon = async (payload:any) => {

  console.log("payload->",payload);
  const [data, error] = await PatchRequestAxios<any>(
    `/coupons`,
    payload
  );
  return { data, error };
};

export const deleteCoupon = async (id: string) => {
  const [data, error] = await DeleteAxios<any>(`/coupons?id=${id}`);
  return { data, error };
};
