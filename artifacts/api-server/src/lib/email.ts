import nodemailer from "nodemailer";

function createTransport() {
  const user = process.env.GMAIL_FROM_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Gmail credentials not configured. Please set GMAIL_FROM_EMAIL and GMAIL_APP_PASSWORD environment variables."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const transporter = createTransport();
  await transporter.sendMail({
    from: `"Reframe Change" <${process.env.GMAIL_FROM_EMAIL}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}
