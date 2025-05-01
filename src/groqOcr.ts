import { Groq } from "groq-sdk";

import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const cleanNumber = (value: any): number | null => {
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.]/g, ""); // Remove $, commas, etc.
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return value;
};

function safeParseInvoice(response: any) {
  return {
    bill_to:
      typeof response.bill_to === "string" ? response.bill_to.trim() : null,
    subtotal: cleanNumber(response.subtotal),
    total: cleanNumber(response.total),
  };
}

export default async function groqTest(img: string) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an invoice parser AI. Always respond ONLY with a JSON object having the following exact keys: bill_to, subtotal, total. Use null for any missing values. Do not include extra explanation or formatting.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `From the image, extract the following fields:

- "bill_to": The name of the person or entity responsible for paying the bill. (Look for 'BILL TO', 'BILLTO', 'INVOICE TO')
- "subtotal": The subtotal amount. (Look for the keyword 'Subtotal','SUBTOTAL' or similar keywords)
- "total": The total amount. (Look for the keyword 'TOTAL','TOTALS' or similar keywords)

Always return this structure, even if some values are missing:

{
  "bill_to": "...",
  "subtotal": "...",
  "total": "..."
}`,
          },
          {
            type: "image_url",
            image_url: {
              url: img,
            },
          },
        ],
      },
    ],
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 1,
    max_completion_tokens: 1024,
    top_p: 1,
    stream: false,
    response_format: { type: "json_object" },
    stop: null,
  });

  const raw = chatCompletion.choices[0].message.content;
  const parsed = JSON.parse(raw!);
  console.log(parsed);
  const cleaned = safeParseInvoice(parsed);
  console.log("Cleaned Invoice:", cleaned);
  return cleaned;
}

// groqTest(
//   "https://marketplace.canva.com/EAFzjHZJWK4/1/0/1131w/canva-black-and-white-minimalist-business-invoice-yl-tw3j9x64.jpg"
// );
