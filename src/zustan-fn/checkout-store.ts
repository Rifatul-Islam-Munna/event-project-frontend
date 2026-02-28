import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CheckoutStore {
  planId: string | null;
  addonIds: string[];
  couponCode: string;
  setPlanId: (id: string | null) => void;
  toggleAddon: (id: string) => void;
  setCouponCode: (code: string) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      planId: null,
      addonIds: [],
      couponCode: "",
      setPlanId: (id) => set({ planId: id }),
      toggleAddon: (id) =>
        set((s) => ({
          addonIds: s.addonIds.includes(id)
            ? s.addonIds.filter((a) => a !== id)
            : [...s.addonIds, id],
        })),
      setCouponCode: (code) => set({ couponCode: code }),
      clearCheckout: () =>
        set({ planId: null, addonIds: [], couponCode: "" }),
    }),
    { name: "checkout-store" }
  )
);
