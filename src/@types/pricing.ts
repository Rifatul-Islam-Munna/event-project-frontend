export interface PricingLimit {
  key: string
  limit: number
}

export interface PricingPlan {
  _id: string
  title: string
  description: string
  priceCents: number
  subPrice?: string
  currency: string
  billingUnit: string
  permissions: string[]
  features?: string[]
  limits: PricingLimit[]
  version: number
  active: boolean
  createdAt: string
  updatedAt: string
  order?: number
  isPopular?: boolean
  type?: string
  __v: number
}

export interface CreatePlanRequest {
  title: string
  description: string
  priceCents: number
  subPrice?: string
  currency: string
  billingUnit: string
  permissions: string[]
  features?: string[]
  limits: PricingLimit[]
  order: number
  isPopular: boolean
  type?: string
}
