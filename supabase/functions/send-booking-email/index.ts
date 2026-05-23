// send-booking-email — sends a transactional email to the client when their
// booking is submitted (acknowledgement) or confirmed by Jae.
//
// Setup:
//   1. Sign up at https://resend.com (free tier: 100/day, 3k/mo)
//   2. Add your sending domain (or use the onboarding@resend.dev sandbox)
//   3. In the Supabase dashboard → Project Settings → Edge Functions → Secrets:
//          RESEND_API_KEY = re_xxx...
//          BOOKING_FROM_EMAIL = "nailz.jae <bookings@your-domain>"
//          (optional) BOOKING_REPLY_TO = "jaelynervin@email.com"
//   4. Deploy:  supabase functions deploy send-booking-email
//
// Request body:
//   { kind: "received" | "confirmed", booking: { name, email, service_name,
//     service_price, date, time, payment, note, deposit_amount } }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("BOOKING_FROM_EMAIL") || "nailz.jae <onboarding@resend.dev>";
const REPLY_TO   = Deno.env.get("BOOKING_REPLY_TO")   || "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function fmtDate(ymd: string) {
  try {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  } catch {
    return ymd;
  }
}

function buildEmail(kind: string, b: Record<string, unknown>) {
  const name = (b.name as string) || "there";
  const service = (b.service_name as string) || "your appointment";
  const date = fmtDate((b.date as string) || "");
  const time = (b.time as string) || "";
  const price = b.service_price ?? "";
  const dep = b.deposit_amount ?? 15;
  const note = (b.note as string) || "";
  const payment = (b.payment as string) || "";

  const confirmed = kind === "confirmed";
  const subject = confirmed
    ? `You're confirmed for ${date} — nailz.jae`
    : `We got your booking — nailz.jae`;

  const headline = confirmed ? "You're confirmed!" : "Booking received";
  const intro = confirmed
    ? "Your deposit is in and your slot is locked. Can't wait to see you!"
    : "Thanks for booking with me. I'll review your deposit and confirm within a few hours — watch your email + IG.";

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3eadb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#14100c;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:32px;color:#14100c;letter-spacing:-0.02em;">
        nailz<span style="color:#c98e8e;">.</span>jae
      </div>
    </div>

    <div style="background:#fff;border:1px solid rgba(20,16,12,.08);border-radius:18px;padding:28px 24px;">
      <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${confirmed ? "#a86b6b" : "#8a7355"};font-weight:600;">
        ${confirmed ? "appointment confirmed" : "booking received"}
      </div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:32px;margin-top:6px;line-height:1.15;">
        ${headline}
      </div>
      <p style="margin:14px 0 0;color:#4a3f36;line-height:1.55;font-size:15px;">
        Hi ${name} — ${intro}
      </p>

      <div style="margin-top:20px;padding:16px;background:#faf3e6;border-radius:12px;border:1px solid rgba(201,142,142,.22);">
        <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8a7355;font-weight:600;">Your appointment</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;margin-top:6px;">${service}</div>
        <div style="color:#4a3f36;font-size:14px;margin-top:4px;">${date}${time ? " · " + time : ""}</div>
        ${price !== "" ? `<div style="color:#4a3f36;font-size:14px;margin-top:2px;">Total: <b>$${price}</b> · Deposit: <b>$${dep}</b> · Due at appt: <b>$${Math.max(0, Number(price) - Number(dep))}</b></div>` : ""}
        ${payment ? `<div style="color:#8a7355;font-size:12px;margin-top:6px;text-transform:capitalize;">Paid via ${payment}</div>` : ""}
        ${note ? `<div style="margin-top:10px;padding:10px;background:rgba(20,16,12,.04);border-radius:8px;font-size:13px;color:#4a3f36;"><b>Your note:</b> ${note}</div>` : ""}
      </div>

      ${confirmed ? "" : `
      <p style="margin:20px 0 0;color:#8a7355;font-size:13px;line-height:1.55;">
        A $${dep} deposit secures your slot — it goes toward your total. Deposits are non-refundable.
      </p>`}

      <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(20,16,12,.08);font-size:12px;color:#8a7355;line-height:1.6;">
        Questions? Reply to this email or DM <b>@nailz.jae</b> on Instagram.<br/>
        — Jaelyn
      </div>
    </div>

    <div style="text-align:center;margin-top:18px;font-size:11px;color:#8a7355;letter-spacing:.08em;">
      nailzjae.tech
    </div>
  </div>
</body></html>`;

  const text = [
    headline.toUpperCase(),
    "",
    `Hi ${name} — ${intro}`,
    "",
    `${service}`,
    `${date}${time ? " · " + time : ""}`,
    price !== "" ? `Total: $${price} · Deposit: $${dep} · Due at appt: $${Math.max(0, Number(price) - Number(dep))}` : "",
    payment ? `Paid via ${payment}` : "",
    note ? `\nYour note: ${note}` : "",
    "",
    "Questions? Reply here or DM @nailz.jae on Instagram.",
    "— Jaelyn",
  ].filter(Boolean).join("\n");

  return { subject, html, text };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!RESEND_API_KEY) {
    return json({ error: "RESEND_API_KEY is not configured" }, 500);
  }

  let body: { kind?: string; booking?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const kind = body.kind === "confirmed" ? "confirmed" : "received";
  const booking = body.booking || {};
  const to = (booking.email as string)?.trim();
  if (!to || !to.includes("@")) {
    return json({ error: "Missing or invalid recipient email" }, 400);
  }

  const { subject, html, text } = buildEmail(kind, booking);

  const payload: Record<string, unknown> = {
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
  };
  if (REPLY_TO) payload.reply_to = REPLY_TO;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[send-booking-email] resend error", res.status, data);
    return json({ error: "Email send failed", detail: data }, 502);
  }

  return json({ ok: true, id: data.id || null });
});
