export type InvoiceCustomerType = "INDIVIDUAL" | "COMPANY"

export interface IndividualInvoiceDetails {
  name: string
  surname: string
  address: string
  vat: string
  email: string
  phoneNumber: string
}

export interface CompanyInvoiceDetails {
  companyName: string
  businessActivity: string
  address: string
  postalCode: string
  vat: string
  taxOffice: string
  email: string
  phoneNumber: string
}

export interface InvoiceBillingDetails {
  customerType: InvoiceCustomerType
  individual: IndividualInvoiceDetails
  company: CompanyInvoiceDetails
}

export interface PurchaseInvoiceItem {
  itemType: string
  itemId?: string
  name: string
  priceCents: number
}

export interface PurchaseInvoiceRecord {
  _id: string
  userId?:
    | string
    | {
        _id: string
        name: string
        email: string
      }
  buyerName: string
  buyerEmail: string
  purchaseType: string
  currency: string
  totalPriceCents: number
  couponCode?: string
  items: PurchaseInvoiceItem[]
  billingDetails: InvoiceBillingDetails
  paid: boolean
  purchasedAt?: string
  invoiceSent: boolean
  invoiceSentAt?: string | null
  paymentIntentId?: string
  createdAt: string
  updatedAt: string
}

export const createDefaultInvoiceDetails = (): InvoiceBillingDetails => ({
  customerType: "INDIVIDUAL",
  individual: {
    name: "",
    surname: "",
    address: "",
    vat: "",
    email: "",
    phoneNumber: "",
  },
  company: {
    companyName: "",
    businessActivity: "",
    address: "",
    postalCode: "",
    vat: "",
    taxOffice: "",
    email: "",
    phoneNumber: "",
  },
})

const isBlank = (value: string) => !value.trim()

export const getInvoiceValidationErrors = (
  details: InvoiceBillingDetails,
): string[] => {
  if (details.customerType === "COMPANY") {
    const company = details.company
    return [
      ...(isBlank(company.companyName) ? ["Company name"] : []),
      ...(isBlank(company.businessActivity) ? ["Business activity"] : []),
      ...(isBlank(company.address) ? ["Company address"] : []),
      ...(isBlank(company.postalCode) ? ["Postal code"] : []),
      ...(isBlank(company.vat) ? ["Company VAT"] : []),
      ...(isBlank(company.taxOffice) ? ["Tax office"] : []),
      ...(isBlank(company.email) ? ["Company email"] : []),
    ]
  }

  const individual = details.individual
  return [
    ...(isBlank(individual.name) ? ["Name"] : []),
    ...(isBlank(individual.surname) ? ["Surname"] : []),
    ...(isBlank(individual.address) ? ["Address"] : []),
    ...(isBlank(individual.vat) ? ["VAT"] : []),
    ...(isBlank(individual.email) ? ["Email"] : []),
  ]
}
