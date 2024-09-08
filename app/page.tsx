'use client'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Script from "next/script"
import { useState } from "react"

export default function Home() {

  const [phone,setPhone] = useState('')



  async function sendOtp(phone) {
    const response = await fetch('/api/sendotp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })  // Assuming phone is a value you want to send
    });
  
    if (!response.ok) {
      // Handle error
      throw new Error('Failed to send OTP');
    }
  
    const data = await response.json();
    return data;
  }

  async function submitHandler(e: any) {
    e.preventDefault();
  
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const turnstileToken = formData.get('cf-turnstile-response') as string;
  
      if (!turnstileToken) {
        console.error("CAPTCHA token is missing");
        alert("Please complete the CAPTCHA challenge.");
        return;
      }
  
      const response = await fetch('/api/captcha', {
        method: "POST",
        body: JSON.stringify({ token: turnstileToken }),
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        console.error("Failed to verify CAPTCHA:", response.statusText);
        // alert("CAPTCHA verification failed. Please try again.");
        sendOtp();
        return;
      }
  
      const result = await response.json();
  
      if (result.success) {
        console.log("CAPTCHA verification succeeded");
        alert("CAPTCHA verification succeeded.");
        // Handle successful login or form submission here
      } else {
        console.error("CAPTCHA verification failed:", result.message);
        alert("CAPTCHA verification failed. Please try again.");
      }
  
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black">
<form onSubmit={submitHandler} >
<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback" defer/>
    <Card className="w-full max-w-sm px-8">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your phone number.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="number">Phone</Label>
          <Input id="phone" type="text" placeholder="Number" onChange={(e)=>{setPhone(e.target.value)}} required />
        </div>
        {/* <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div> */}

      </CardContent>
      <div className='flex justify-center items-center w-full'>
      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_CAPTCHA} data-callback="javascriptCallback"></div>

      </div>
      <CardFooter>
        <Button type="submit" className="w-full">Login</Button>
      </CardFooter>
    </Card>
    </form>
    </main>
  );
}
