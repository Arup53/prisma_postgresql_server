import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_TEST_API_KEY || "");

export async function test() {
  const cardholder = await stripe.issuing.cardholders.create({
    name: "carl Rosen",
    email: "carl.rosen@example.com",
    phone_number: "+18008675309",
    status: "active",
    type: "individual",
    individual: {
      first_name: "carl",
      last_name: "Rosen",
      dob: { day: 1, month: 11, year: 1981 },
    },
    billing: {
      address: {
        line1: "123 Main Street",
        city: "San Francisco",
        state: "CA",
        postal_code: "94111",
        country: "US",
      },
    },
  });

  const card = await stripe.issuing.cards.create({
    cardholder: cardholder.id,
    currency: "usd",
    type: "virtual",
  });

  return {
    cardholderId: cardholder.id,
    cardId: card.id,
  };
}

export async function update(cardHolderId: string, cardId: string) {
  const currentUnixTimestamp = Math.floor(Date.now() / 1000);
  const cardholder = await stripe.issuing.cardholders.update(cardHolderId, {
    individual: {
      card_issuing: {
        user_terms_acceptance: {
          date: currentUnixTimestamp,
        },
      },
    },
  });
  console.log("Cardholder updated:", cardholder);

  const card = await stripe.issuing.cards.update(cardId, {
    status: "active",
  });
  console.log(card);
}
