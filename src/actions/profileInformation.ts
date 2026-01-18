"use server"

import { PatchRequestAxios, PostRequestAxios } from "@/api-fn/api-hook";
import { cookies } from "next/headers";
type User = {
  name?: string;
  email?: string;
  password?: string;
  profile?: File;    // URL
  thumbnail?: File;  // URL
  
};



export const updateProfileInformation = async (payload:User)=>{
    let profileImageUrl:string = '';
    let thumbnailUrl:string = '';
  
  if(payload.thumbnail){
     const fromData = new FormData();
    if(payload.thumbnail) fromData.append("file",payload.thumbnail);

    const [updatedData,err] = await PostRequestAxios("/images/upload-image",fromData);

   if(err) return {data:null,error:err};
    thumbnailUrl = updatedData as string;

   

  }
  if(payload.profile){
     const fromData = new FormData();
    if(payload.profile) fromData.append("file",payload.profile);

    const [updatedData,err] = await PostRequestAxios("/images/upload-image",fromData);

   if(err) return {data:null,error:err};
    profileImageUrl = updatedData as string;

    

  }



   
    const newPayload = {
    ...payload,
    ...(thumbnailUrl.trim() && { thumbnail: thumbnailUrl }),
    ...(profileImageUrl.trim()  && { profile: profileImageUrl }),
  };
    const [data,error] = await PatchRequestAxios(`/user/update-user`,newPayload);
    if(data){
           const coookies = await cookies()
             coookies.set("user_info",JSON.stringify(data),{maxAge:60*60*24,path:'/',httpOnly:true})
    }
    console.log("user-updated-data->",data,"vendor-error-update-also-user-updated-data->",error);
    return {data,error}
}