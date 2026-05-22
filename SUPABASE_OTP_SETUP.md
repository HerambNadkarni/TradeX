# TradeX email OTP setup (fix: link → 6-digit code)

If you receive a **Supabase link** instead of a **6-digit code**, change these settings once in your Supabase project.

## Step 1 — Enable Email OTP (required)

1. [Supabase Dashboard](https://supabase.com/dashboard) → your project  
2. **Authentication** → **Providers** → **Email**  
3. Turn **ON**: **Confirm email**  
4. Turn **ON**: **Email OTP** (or “Secure email change” / OTP mode — wording varies)  
5. **Turn OFF** or avoid “Magic Link only” as the sole signup method  
6. **Save**

## Step 2 — Use TradeX email template (Magic Link template)

Supabase sends OTP codes through the **Magic Link** template using `{{ .Token }}`.

1. **Authentication** → **Email Templates** → **Magic Link**  
2. **Subject:** `Your TradeX verification code`  
3. **Body:** copy everything from  
   `supabase/email-templates/tradex-signup-otp.html`  
4. **Remove** or hide any “Click here to confirm” link that uses `{{ .ConfirmationURL }}`  
5. **Keep** only the line with `{{ .Token }}` (the 6-digit code)  
6. Save  

Optional — same for **Confirm signup** template if you use it:

- Subject: `Your TradeX verification code`  
- Body: same HTML, show `{{ .Token }}` only  

## Step 3 — Sender name (looks like “from TradeX”)

1. **Project Settings** → **Authentication** → **SMTP Settings**  
2. Enable **Custom SMTP** (Resend, SendGrid, Gmail SMTP, etc.)  
3. Set **Sender email:** e.g. `noreply@yourdomain.com`  
4. Set **Sender name:** `TradeX`  

Without custom SMTP, emails still come from Supabase’s address but the **subject and body** will say TradeX after Step 2.

## How the app sends OTP now

The app uses **`signInWithOtp`** (not signup confirmation links):

1. You submit signup → TradeX saves your details  
2. Supabase emails a **6-digit code** (via Magic Link template + `{{ .Token }}`)  
3. You enter the code in TradeX  
4. App sets your password and logs you in  

No `emailRedirectTo` / magic link is used during signup anymore.

## Quick test

1. Sign up with a real inbox  
2. Email subject should be **“Your TradeX verification code”**  
3. Body shows a **6-digit number** (not only a button/link)  
4. Enter that code on the verify screen  

## Still getting a link?

- Confirm **Email OTP** is enabled (Step 1)  
- Edit **Magic Link** template — remove `{{ .ConfirmationURL }}` (Step 2)  
- Check spam; some clients hide the code below the link  
- Wait 1 minute and use **Resend code** on the verify screen  
