import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/lib/supabase/server";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  template?: string;
  relatedBookingId?: string;
  relatedCampOrderId?: string;
  relatedEnrolmentId?: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

function transporter() {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) {
    throw new Error("Missing SMTP_HOST / SMTP_USER / SMTP_PASSWORD");
  }
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

export async function sendEmail(args: SendArgs) {
  const fromName = process.env.SMTP_FROM_NAME || "Obsidian Volleyball Academy";
  const fromEmail = process.env.SMTP_USER!;
  const from = `${fromName} <${fromEmail}>`;

  let status: "sent" | "failed" = "sent";
  let smtpError: string | null = null;

  try {
    await transporter().sendMail({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
  } catch (err) {
    status = "failed";
    smtpError = err instanceof Error ? err.message : String(err);
  }

  // Log every attempt (success or failure) for admin visibility.
  // Don't let logging failures swallow the original error.
  try {
    await supabaseAdmin()
      .from("email_log")
      .insert({
        to_email: args.to,
        from_email: fromEmail,
        subject: args.subject,
        template: args.template ?? null,
        related_booking_id: args.relatedBookingId ?? null,
        related_camp_order_id: args.relatedCampOrderId ?? null,
        related_enrolment_id: args.relatedEnrolmentId ?? null,
        status,
        smtp_error: smtpError,
      });
  } catch {
    // Swallow log-write errors; email status logging is best-effort
  }

  if (status === "failed") {
    throw new Error(`SMTP send failed: ${smtpError}`);
  }
}
