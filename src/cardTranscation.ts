import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_TEST_API_KEY || "");

export async function test(name: string, email: string) {
  const cardholder = await stripe.issuing.cardholders.create({
    name: name,
    email: email,
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

  const card = await stripe.issuing.cards.update(cardId, {
    status: "active",
  });
}

export async function payWithVirtualCard(cardId: string, amount: number) {
  const authorization = await stripe.testHelpers.issuing.authorizations.create({
    amount: amount, // Amount in cents ($50.00)
    currency: "usd",
    card: cardId,
  });

  //   const authorizationDetails = await stripe.issuing.authorizations.retrieve(
  //     authorization.id
  //   );

  const authorizationpayment =
    await stripe.testHelpers.issuing.authorizations.capture(authorization.id);

  return authorizationpayment;
}
