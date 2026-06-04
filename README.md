# COSOCKET – Setup Instructions

## Files
- `index.html` — Main landing page
- `dashboard.html` — Provider dashboard
- `styles.css` — All styles
- `script.js` — Main JS (machines, booking, WhatsApp, address autocomplete)
- `supabase-config.js` — ⚠️ EDIT THIS with your Supabase credentials

---

## Step 1 — Add Your Supabase Credentials

Open `supabase-config.js` and replace:

```js
const SUPABASE_URL  = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
```

Find these in: **Supabase Dashboard → Project Settings → API**

---

## Step 2 — Run the SQL in Supabase

Go to **Supabase → SQL Editor** and paste the tables SQL (already done per your message).

Also add this column if not already present (for earnings tracking):

```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS daily_rate INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS days INTEGER;
ALTER TABLE machines ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🔧';
```

---

## Step 3 — Push to GitHub

```bash
git add .
git commit -m "Supabase + WhatsApp + address autocomplete"
git push origin main
```

GitHub Pages will deploy automatically to your custom domain.

---

## Features Added

### ✅ WhatsApp Auto-Messaging
- When a customer books, WhatsApp opens automatically with their booking details
- A second message goes to admin (+91 93224 51995)
- Both messages are pre-filled — customer just taps "Send"

### ✅ Address Autocomplete
- Uses OpenStreetMap Nominatim (free, no API key needed)
- Biased to Pune/Maharashtra region
- Dropdown shows as you type (after 4 characters)

### ✅ Supabase Integration
- Bookings saved to `bookings` table on submit
- Machines loaded from `machines` table
- Provider listings saved to `provider_listings` table
- Dashboard reads from Supabase, falls back to localStorage

### ✅ Improved UI
- New fonts: Syne (headings) + DM Sans (body)
- Machine cards with price + Book button side by side
- Booking summary panel (shows days/total/advance before submitting)
- Status badges with color coding
- Better modals with slide-up animation
- Mobile responsive

---

## Troubleshooting

**WhatsApp not opening?**  
Some browsers block popups. Tell customers to allow popups for your site.

**Address suggestions not showing?**  
Nominatim has a rate limit. If it fails silently, type more characters and wait 1 second.

**Machines not loading from Supabase?**  
Check that your RLS policies allow public SELECT. The default machines will show as fallback.

**Dashboard shows 0 earnings?**  
Earnings currently read from localStorage. For real earnings from Supabase, the `total_amount` column must exist in the `bookings` table (see Step 2 SQL above).