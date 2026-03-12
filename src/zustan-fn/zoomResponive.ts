import {create} from 'zustand';
type state={
    isEditMode:boolean;
    imageUrl:string;
    hasImageOverride:boolean;

}
type actions={
    setIsEditMode:(data:boolean)=>void;
    setImageUrl:(data:string)=>void;
    clearImageUrl:()=>void;
    resetImageOverride:()=>void;
}
export const useZoomResponive=create<state & actions>((set)=>({
    isEditMode:false,
    imageUrl:'',
    hasImageOverride:false,
    setIsEditMode:(data:boolean)=>set(()=>({isEditMode:data})),
    setImageUrl:(data:string)=>set(()=>({imageUrl:data,hasImageOverride:true})),
    clearImageUrl:()=>set(()=>({imageUrl:'',hasImageOverride:true})),
    resetImageOverride:()=>set(()=>({imageUrl:'',hasImageOverride:false}))
}))
