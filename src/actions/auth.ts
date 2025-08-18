"use server"
import { LoginResponse, User } from "@/@types/user-types"
import { PostRequestAxios } from "@/api-fn/api-hook"
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import sanitizeHtml from 'sanitize-html';
export const getToken = async ()=>{
    const access_token = (await cookies()).get("access_token")?.value
  
    return {access_token}
}
export const loginUser = async (email:string,password:string)=>{
    const payload ={email,password}
    const [data,error] = await PostRequestAxios<LoginResponse>(`/user/login-user`,payload);
    console.log("data-user-login->",data,"error-user-login->",error);
    if(data?.access_token){
     const coookies = await cookies()
      coookies.set("access_token",data?.access_token,{maxAge:60*60*24*60,path:'/'});
      coookies.set("user_info",JSON.stringify(data?.data),{maxAge:60*60*24*60,path:'/'})
   
    
    }
 
    return {data,error}
}
export const studentSignUp = async (name:string,email:string,password:string)=>{
       console.log(name, email, password);
    const names = sanitizeHtml(name);
    const emails = sanitizeHtml(email);
     if(name.length < 3 || email.length < 5){
        return {data:null,error:{message:"At last 3 characters in name and 5 characters in email",statusCode:400}}
     }
    const passwords = sanitizeHtml(password);
    const payload = {name:names,email:emails,password:passwords}
    const [data,error]  = await PostRequestAxios(`/user`,payload);

    return {data,error}



}

export const getUserInfo = async ():Promise<User> =>{
     const coookies = await cookies()
   const s = coookies.get("user_info")?.value  ?? ''
   return JSON.parse(s)
}


export const logoutUser = async ()=>{
    const coookies = await cookies()
    coookies.delete("access_token");
    coookies.delete("user_info");
    redirect('/login')
}

