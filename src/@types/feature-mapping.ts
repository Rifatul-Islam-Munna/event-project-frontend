// Feature and permission mapping for user-friendly display
export const featureMapping = {

  "user.create": "Create user accounts",
  "user.edit": "Edit user profiles",
  "user.delete": "Delete user accounts",


  "event.create": "Create events",
  "event.edit": "Edit event details",
  "event.delete": "Delete events",


  
  "qr.live": "Live QR code generation",



  "csv.import": "CSV guest list import",

  "email.send": "Email notifications",
  "whatsapp.send": "WhatsApp messaging",
  "message.send": "SMS messaging",

  "vendor.manage": "Vendor management system",



}

export const limitMapping = {
  "guests.total_max": "Maximum guests",
  "vendor.limit": " vendor Per event limit",
  "events.monthly_limit": "Monthly events limit",


 
}

export function getFeatureDescription(key: string): string {
  return featureMapping[key as keyof typeof featureMapping] || key
}

export function getLimitDescription(key: string): string {
  return limitMapping[key as keyof typeof limitMapping] || key
}
