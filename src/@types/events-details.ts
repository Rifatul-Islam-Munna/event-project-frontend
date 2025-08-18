export type Guest = {
  id: string
  name: string
  email: string
  phone: string
  seat_number?: number // Still allow for data, but not in form
  isAssigned?: boolean 
  event_id?:string// Still allow for data, but not in form
  _id?:string
}

export type Vendor = {
  id: string
  name: string
  email: string
  whatsapp: string
  reminder_message: string
  sent_status?: boolean // Still allow for data, but not in form
  number_of_reminder?: number // Still allow for data, but not in form
  starting_date: string
  end_date?: string
  _id?:string
  event_id?:string
}

export type EventItem = {
  _id: string;
  user_id: string;
  name: string;
  date: string; // format: YYYY-MM-DD
  location: string;
  logo_path: string; // URL
  slug: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  __v: number;
};

export type EventList = {
  data:EventItem[],
  metaData:{
    page:number,
    limit:number,
    total:number
  }
};
