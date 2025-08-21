import { create } from "zustand";

interface StoreState {
  dataLength: number;
  setDataLength: (length: number) => void;
  setDataAll: (length: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  dataLength: 0,
  setDataLength: (length) => set(() => ({ dataLength: length })),
  setDataAll: (length) => set((state) => ({ dataLength:state.dataLength + length })),

}));
