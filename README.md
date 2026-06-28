# 🏙️ PulseNet: The Civic Meritocracy Engine

PulseNet is a dual-sided, AI-powered civic tech platform designed to solve the "Cold Start" problem in municipal infrastructure repair. By gamifying civic reporting and introducing a Help Coin bounty system, PulseNet incentivizes gig workers and holds local governments accountable through automated, multi-channel escalation.

**Built for the Google AI Hackathon.**

## 🚀 The Core Innovation

Traditional civic complaint portals fail because they lack incentives for the repair workers and transparency for the citizens. PulseNet introduces a closed-loop digital economy:
1. **Citizens** report hazards (potholes, leaks) using verified geolocation.
2. **Responders** claim these tickets as gigs.
3. **Google Gemini Vision AI** acts as an automated auditor, comparing "Before" and "After" photos to mathematically verify physical repairs and prevent bounty fraud.

## ✨ Key Features

* **AI Proof-of-Work (Anti-Cheat):** Utilizes Gemini 1.5 Flash Vision to compare pre- and post-repair images, ensuring accurate resolutions and blocking duplicate or digitally altered uploads.
* **The "Trojan Horse" Escalation Engine:** Automatically generates highly formal PDF dossiers of unresolved tickets and emails them directly to legacy government inboxes via Node.js cron jobs.
* **Ghost Mode (Verified Anonymity):** Protects vulnerable whistleblowers by masking their identity on the public feed while keeping their wallet securely tied to the backend for reward payouts.
* **Self-Funded Community Hubs:** Allows citizens to pool their earned Help Coins to crowdfund local grassroots initiatives like street cleanups or tree planting.

## 🛠️ Tech Stack & Google Technologies Utilized

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
* **Design System:** Custom Watermorphism + Bento Grid UI
* **Backend:** Node.js Server Actions
* **Database & Auth:** Supabase (PostgreSQL) with strict Row Level Security (RLS)
* **AI Engine:** Google Gemini API (`gemini-1.5-flash`)
* **Deployment:** Google Cloud Run
* **Integrations:** Google Maps Geolocation API, Resend (Email Automation), PDFKit

## 🔒 Security Architecture

PulseNet is built with enterprise-grade security principles:
* **Row Level Security (RLS):** Strictly isolates citizen and official data mutations at the database level.
* **Cryptographic Hashing:** Implements SHA-256 checks on image uploads to instantly reject exact-duplicate file fraud before hitting the AI layer.
* **Stateless Automation:** The PDF and Email escalation pipelines run purely in server memory, leaving no residual files on the disk.

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/pulsenet.git](https://github.com/yourusername/pulsenet.git)
