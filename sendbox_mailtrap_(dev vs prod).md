# The Full Picture

```Your Code (nodemailer)
        ↓
SMTP Server (mailtrap/sendgrid/gmail)
        ↓
Recipient's Mail Server
        ↓
User's Inbox
```

---

## What Each Thing Is

**Nodemailer:**
> Just a Node.js library that knows how to **talk to SMTP servers**. It's not a mail server itself — just a messenger.

**SMTP (Simple Mail Transfer Protocol):**
> The **language** email servers use to communicate. Like HTTP is for web — SMTP is for email.
> Port `2525`, `465`, `587` — all SMTP ports. Different ports for different security levels.

**Mailtrap:**
> A **fake SMTP server** for development. Catches all emails — never delivers them. Shows them in their dashboard instead.

**Transporter:**
> Your configured connection to an SMTP server. Set it up once with credentials — use it everywhere.

---

## Development vs Production Flow

**Development (Mailtrap Sandbox):**

```Your code sends email
        ↓
nodemailer connects to sandbox.smtp.mailtrap.io
        ↓
Mailtrap catches email
        ↓
Shows in Mailtrap dashboard ✅
Real user NEVER gets it ❌
```

**Production (Real SMTP):**

```Your code sends email
        ↓
nodemailer connects to real SMTP (SendGrid/Resend)
        ↓
SMTP server delivers to recipient's mail server
        ↓
User gets email in inbox ✅
```

---

## Why Sandbox in Development?

> Imagine testing forgot password 50 times — you'd spam 50 real emails to real users. Sandbox catches all of them safely.

---

## Your `.env` — One Naming Issue

You used:

```MAILTRAP_USERNAME  // your .env
MAILTRAP_USER      // standard naming
```
