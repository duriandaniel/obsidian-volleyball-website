import { redirect } from "next/navigation";

// Term = junior weekly classes. Adult drop-in lives at /booking/adult now, so
// this entry just forwards to the junior class list.
export default function TermRedirect() {
  redirect("/booking/term/junior");
}
