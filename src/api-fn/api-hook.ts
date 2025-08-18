
import { fetchError } from "@/@types/user-types"
import { getToken } from "@/actions/auth"
import axios from "axios"
import { AxiosError } from "axios"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { redirect } from 'next/navigation'




const baseUrl = process.env.BASE_URL
type ApiErrorResponse = {
  message: string | { message: string } | { message: string[] };
  statusCode: number;
};
function parseAxiosError(error:  AxiosError<ApiErrorResponse>): { message: string; statusCode: number }  {
  const res = error?.response?.data ;
  const statusCode = error?.response?.data?.statusCode ?? 500;

  let message = 'Something went wrong';

  if (res?.message) {
    if (Array.isArray((res.message as { message: string[] })?.message)) {
     
      message = (res.message as { message: string[] }).message[0];
    } else if (typeof res.message === "string") {
     
      message = res.message;
    } else if (typeof (res.message as { message: string } )?.message === "string") {
      
      message = (res.message as { message: string }).message;
    }
  }

  return { message, statusCode };
}

export const PostRequestAxios = async <T>(url: string, payload: Record<string, unknown> | FormData  ) : Promise<[T | null, { message: string; statusCode: number } | null]> => {
    const {access_token} = await getToken()
    try{
        const {data} = await axios.post(`${baseUrl}${url}`, payload,{
            headers:{
                access_token:access_token,
            
            }
            
        })
        return [data,null];

    }catch(error ){
        if (axios.isAxiosError(error)) {
            if (error.status === 401) {
                throw redirect('/login')
                
                }
                console.log("error->",error.response?.data)
               
             const meg = parseAxiosError(error as AxiosError<ApiErrorResponse>);
             

    return [null, meg]; 
        }
          if (isRedirectError(error)) throw error;
       
        return [null, null];
    }
}
export const PatchRequestAxios = async <T>(url: string, payload: Record<string, unknown> | FormData) : Promise<[T | null, { message: string; statusCode: number } | null]> => {
    const {access_token} = await getToken()
    try{
        const {data} = await axios.patch<T>(`${baseUrl}${url}`, payload,{
            headers:{
                access_token:access_token,
            
            }
            
        })
        return [data,null];

    }catch(error ){
        if (axios.isAxiosError(error)) {
            if (error.status === 401) {
                throw redirect('/login')
                
                }
                console.log("error->",error.response?.data)
               
             const meg = parseAxiosError(error as   AxiosError<ApiErrorResponse>);
             

       return [null, meg]; 
        }
        if (isRedirectError(error)) throw error;
       
        return [null, null];
    }
}
export const GetRequestAxios = async <T>(url: string, ) : Promise<[T | null, AxiosError | null]> => {
    try{
        const {data} = await axios.get(`${baseUrl}${url}`)
        return [data,null];

    }catch(error ){
        if (axios.isAxiosError(error)) {
            return [null, error]; 
        }
       
        return [null, null];
    }
}
export const GetRequestNormal = async <T>(url: string,revalidate=1 ,revalidateTags="t") : Promise<[T | null, fetchError | null]> => {
    const {access_token} = await getToken()
    
    try{
        const response = await fetch(`${baseUrl}${url}`,{cache:"no-store",headers:{
               
                access_token:access_token ? access_token : '',
                
               

        }})
       if (response.ok) {
      const data = await response.json()
       console.log("data",data)
      return [data, null]
    } else {
        console.log("response",response.status)
      if (response.status === 401) {
       throw redirect('/login')
      }
   
      const errorPayload = await response.json()
      console.log("error",errorPayload)
      return [null, {
          message: errorPayload.message, 
          
          statusCode: response.status
      }]
    }

    }catch(error ){
          if (isRedirectError(error)) throw error;
       if (error instanceof Error) {
      return [null, {
          message: error.message, 
         statusCode: 500
      }]
    }
    return [null, {
        message: 'Unknown error occurred',
         statusCode: 500
    }]
           
            
         
         
        
       
      
    }
}

export const DeleteAxios = async <T>(url: string) : Promise<[T | null, { message: string; statusCode: number } | null]> => {
    const {access_token} = await getToken()
    try{
        const {data} = await axios.delete(`${baseUrl}${url}`,{
            headers:{
                access_token:access_token,
            
            }
            
        })
        return [data,null];

    }catch(error ){
        if (axios.isAxiosError(error)) {
            if (error.status === 401) {
                throw redirect('/login')
                
                }
                console.log("error->",error.response?.data)
               
             const meg = parseAxiosError(error as   AxiosError<ApiErrorResponse>);
             

       return [null, meg]; 
        }
        if (isRedirectError(error)) throw error;
       
        return [null, null];
    }
}
