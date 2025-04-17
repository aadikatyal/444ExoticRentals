import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Notify Admin Function started");

serve(async (req: Request) => {
  try {
    const body = await req.json();

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, ADMIN_PHONE_NUMBER } = Deno.env.toObject();

    const messageBody = `Booking request received:\nCar: ${body.carName}\nDates: ${body.start_date} to ${body.end_date}\nLocation: ${body.location}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const formData = new URLSearchParams({
      To: ADMIN_PHONE_NUMBER,
      From: TWILIO_PHONE_NUMBER,
      Body: messageBody,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Failed to send SMS:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});