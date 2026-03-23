import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "noreply@reframechange.com";

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured. Please add it as an environment secret.");
  }
  sgMail.setApiKey(apiKey);
  await sgMail.send({
    to: params.to,
    from: fromEmail,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}
