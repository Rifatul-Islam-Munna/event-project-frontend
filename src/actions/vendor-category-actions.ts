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
