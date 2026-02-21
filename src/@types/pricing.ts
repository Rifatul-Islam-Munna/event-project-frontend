export interface PricingLimit {
  key: string
  limit: number
}

export interface PricingPlan {
  _id: string
  title: string
  description: string
  priceCents: number
  currency: string
  billingUnit: string
  permissions: string[]
  features?: string[]
  limits: PricingLimit[]
  version: number
  active: boolean
  createdAt: string
  updatedAt: string
    order: number;        
  isPopular: boolean; 
  __v: number
}

export interface PricingLimit {
  key: string
  limit: number
}

export interface PricingPlan {
  _id: string
  title: string
  description: string
  priceCents: number
  currency: string
  billingUnit: string
  permissions: string[]
  limits: PricingLimit[]
  version: number
  active: boolean
  createdAt: string
  updatedAt: string
  type?:string;
  __: number
}

export interface CreatePlanRequest {
  title: string
  description: string
  priceCents: number
  currency: string
  billingUnit: string
  permissions: string[]
  limits: PricingLimit[]
  order: number;        // ✅ NEW
  isPopular: boolean;   // ✅ NEW
  type?:string
}