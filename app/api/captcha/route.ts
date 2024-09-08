import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const captchaSecret = '0x4AAAAAAAhgZVQGnr_dQ92defhcPPPHOGE';

function ips(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(/\s*,\s*/);
}

export async function POST(req: NextRequest) {
  try {
    const  {token}  = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, message: "CAPTCHA token is missing" }, { status: 400 });
    }

    const clientIps = ips(req) || [""];
    const ip = clientIps[0];

    const formData = new FormData();
    formData.append("secret", captchaSecret);
    formData.append("response", token);
    formData.append("remoteip", ip);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const result = await fetch(url, {
      body: formData,
      method: 'POST',
    });

    if (!result.ok) {
      return NextResponse.json({ success: false, message: "Failed to verify CAPTCHA" }, { status: result.status });
    }

    const outcome = await result.json();

    if (outcome.success) {
      return NextResponse.json({ success: true, message: "CAPTCHA verification succeeded" });
    } else {
      return NextResponse.json({ success: false, message: "CAPTCHA verification failed" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error during CAPTCHA verification:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
