import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createDefaultInvoiceDetails,
  type InvoiceBillingDetails,
} from "@/@types/invoice";

interface CheckoutStore {
  planId: string | null;
  addonIds: string[];
  couponCode: string;
  invoiceDetails: InvoiceBillingDetails;
  setPlanId: (id: string | null) => void;
  toggleAddon: (id: string) => void;
  setCouponCode: (code: string) => void;
  setInvoiceDetails: (details: InvoiceBillingDetails) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      planId: null,
      addonIds: [],
      couponCode: "",
      invoiceDetails: createDefaultInvoiceDetails(),
      setPlanId: (id) => set({ planId: id }),
      toggleAddon: (id) =>
        set((s) => ({
          addonIds: s.addonIds.includes(id)
            ? s.addonIds.filter((a) => a !== id)
            : [...s.addonIds, id],
        })),
      setCouponCode: (code) => set({ couponCode: code }),
      setInvoiceDetails: (details) => set({ invoiceDetails: details }),
      clearCheckout: () =>
        set({
          planId: null,
          addonIds: [],
          couponCode: "",
          invoiceDetails: createDefaultInvoiceDetails(),
        }),
    }),
    { name: "checkout-store" }
  )
);
