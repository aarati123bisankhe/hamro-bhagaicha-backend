import { HttpError } from "../errors/http-error";

type SendSmsInput = {
    to: string;
    message: string;
};

const SMS_PROVIDER = process.env.SMS_PROVIDER || "twilio";
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

const ensureTwilioConfig = () => {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
        throw new HttpError(
            500,
            "SMS provider is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.",
        );
    }
};

const sendViaTwilio = async ({ to, message }: SendSmsInput) => {
    ensureTwilioConfig();

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const encodedCredentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Basic ${encodedCredentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            To: to,
            From: TWILIO_FROM_NUMBER!,
            Body: message,
        }),
    });

    const data: any = await response.json();

    if (!response.ok) {
        throw new HttpError(response.status, data?.message || "Failed to send SMS");
    }

    return {
        sid: data.sid,
        status: data.status,
        to: data.to,
    };
};

export const sendSms = async (input: SendSmsInput) => {
    if (SMS_PROVIDER.toLowerCase() !== "twilio") {
        throw new HttpError(500, `Unsupported SMS provider: ${SMS_PROVIDER}`);
    }

    return sendViaTwilio(input);
};

