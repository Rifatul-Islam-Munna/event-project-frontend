import {create} from 'zustand';
type state={
    isEditMode:boolean;
    imageUrl:string

}
type actions={
    setIsEditMode:(data:boolean)=>void;
    setImageUrl:(data:string)=>void
}
export const useZoomResponive=create<state & actions>((set)=>({
    isEditMode:false,
    imageUrl:'',
    setIsEditMode:(data:boolean)=>set(()=>({isEditMode:data})),
    setImageUrl:(data:string)=>set(()=>({imageUrl:data}))
}))