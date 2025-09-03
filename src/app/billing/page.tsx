import { prepareBilling } from "@/actions/fetch-action"; // server action
import BillingShell from "./BillingShell"; // client wrapper

export default async function BillingPage() {
  const { clientSecret } = await prepareBilling(); // runs on server
  return <BillingShell clientSecret={clientSecret} />; // hand off to client
}
