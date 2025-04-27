import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: "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",
});
export default async function groqTest(img: string) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Answer the following:1. What is the name of the person or entity responsible for paying the bill? (Look for BILLTO or BILL TO or INVOICE TO similar keywords)2. What is the subtotal amount? (Look for the keyword Subtotal)3. What is the total amount? (Look for the keyword TOTAL) .List the answer in JSON format.",
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

  console.log(chatCompletion.choices[0].message.content);
  return chatCompletion.choices[0].message.content;
}
