import { redirect } from "next/navigation";

// The Men's Development Squad is postponed: trials are no longer bookable.
// /mens-squad explains the postponement and collects expressions of interest.
export default function MensSquadBookingPage() {
  redirect("/mens-squad");
}
