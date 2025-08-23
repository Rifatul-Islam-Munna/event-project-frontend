export interface User {
  _id: string
  name: string
  email: string
}

export interface Subscription {
  _id: string
  userId: User
  startedDate: string
  endDate: string
  subscriptionType: "basic" | "premium" | "enterprise"
  createdAt: string
  updatedAt: string
  __v: number
}

export interface SubscriptionResponse {
  data: Subscription[]
  total: number
  page: number
  limit: number
}

export interface SubscriptionFilters {
  subscriptionType?: "basic" | "premium" | "enterprise"
  status?: "active" | "expired"
  q?: string
  sortBy?: "createdAt" | "startedDate" | "endDate" | "subscriptionType"
  sortOrder?: "asc" | "desc"
  page: number
  limit: number
}
