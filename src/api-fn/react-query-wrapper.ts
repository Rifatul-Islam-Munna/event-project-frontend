import { QueryKey, useMutation, useQuery, UseQueryOptions,MutationKey } from "@tanstack/react-query";
import { GetRequestNormal } from "./api-hook";
import {  UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";


export function useQueryWrapper<T>(
  key: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>,
  revalidate?: number,
  tag?:string
) {


  return useQuery<T, Error>({
    queryKey: key,
    queryFn: ()=>GetRequestNormal<T>(url,revalidate,tag),
  
    ...options,
  });
}







export function useApiMutation<TVars = any, TData = any>(
  apiFn: (variables: TVars) => Promise<{ data: TData | null; error: { message: string; statusCode?: number } | null }>,
  options?: Omit<UseMutationOptions<{ data: TData | null; error: { message: string; statusCode?: number } | null }, any, TVars>, 'mutationFn'>,
  name?: string,
  onSuccessCallback?: (data: TData) => void
) {
  return useMutation({
    mutationKey: [name],
    mutationFn: apiFn,
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(res.error.message);
        return;
      }

      // Call your custom success callback
      if (onSuccessCallback && res.data) {
        onSuccessCallback(res.data);
      }

      toast.success("Operation successful");

     
    },
    onError: (err) => {
      toast.error(err?.message || "Unknown error");
     
    },
    ...options,
  });
}
