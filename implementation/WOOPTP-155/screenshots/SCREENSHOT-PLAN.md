# Screenshot Plan — WordPress.org Plugin Page

**Target:** 5 screenshots for `readme.txt` `== Screenshots ==` section
**Format:** 1200×800px PNG, clean WordPress admin theme (Twenty Twenty-Five)
**Environment:** WordPress Playground or local dev with demo data

---

## Screenshot 1: Connect PayPal (Wizard Credentials Step)

**readme.txt caption:** "Connect PayPal — Enter API credentials from the PayPal Developer Dashboard."

**What to capture:**
- Block editor with a new PayPal Payment Buttons block
- Wizard on the **Credentials step** (step 2 of 3)
- Step indicator visible (1 → **2** → 3)
- Client ID field populated with a realistic-looking value (e.g., `AXBOqFgtrx_...`)
- Client Secret field with value hidden (password dots)
- "Use Sandbox for testing" link visible at bottom
- Clean, no errors showing

**Setup steps:**
1. Create new post
2. Add PayPal Payment Buttons block
3. Click "Get Started" (welcome → dashboard)
4. Click "I have my credentials" (dashboard → credentials)
5. Type sample Client ID
6. Type sample Client Secret
7. Take screenshot

---

## Screenshot 2: Create Button (Product Form)

**readme.txt caption:** "Create Button — Fill in product name, price, and currency in the block editor."

**What to capture:**
- Block editor showing the **product creation form** (connected state)
- "PayPal Connected" status badge visible (green)
- Product Name field: "Premium Widget"
- Price field: "29.99"
- Currency dropdown showing "USD"
- Description field: "A premium widget with all the features you need."
- "Create Button" button enabled (blue/primary)
- Sidebar showing "PayPal Connection" panel

**Setup steps:**
1. Use an already-connected state (pre-stored credentials)
2. Add a new PayPal Payment Buttons block
3. Fill in form fields
4. Take screenshot before clicking Create

---

## Screenshot 3: Live Preview (Editor Preview After Creation)

**readme.txt caption:** "Live Preview — See the PayPal-branded button preview before publishing."

**What to capture:**
- Block editor showing the **button preview** (after creation)
- Product card with name "Premium Widget", price "$29.99"
- Gold PayPal button with PayPal logo + "Pay Now" text
- "Debit or Credit Card" secondary button (stacked layout)
- Block toolbar visible showing Edit/Preview toggle
- Sidebar showing Edit Button / Delete Button controls

**Setup steps:**
1. Open the "PayPal Button — Stacked Layout" demo post in the editor
2. Click the PayPal block to select it
3. Take screenshot showing the preview + sidebar controls

---

## Screenshot 4: Frontend (Published Button)

**readme.txt caption:** "Frontend — Published PayPal button with product info and payment link."

**What to capture:**
- **Frontend view** (not editor) of a published post with a PayPal button
- Twenty Twenty-Five theme
- Product info: "Premium Widget" with "$29.99" price
- Gold PayPal button with logo
- Clean, no admin bar (use logged-out view or hide admin bar)
- Show the button in context of a real-looking post with some paragraph text

**Setup steps:**
1. View the "PayPal Button — Stacked Layout" demo post on the frontend
2. Log out or hide admin bar
3. Take screenshot of the button area

---

## Screenshot 5: Stacked Layout (Both Buttons)

**readme.txt caption:** "Stacked Layout — PayPal button with Debit/Credit Card secondary button."

**What to capture:**
- **Close-up frontend view** of the stacked layout
- Gold PayPal button (primary) with PayPal wordmark SVG
- Dark "Debit or Credit Card" button (secondary) below it
- "Powered by PayPal" attribution below
- Centered, clean crop — just the button component, no surrounding page chrome

**Setup steps:**
1. Same post as screenshot 4
2. Crop tightly to just the button component
3. Take screenshot

---

## Automation

A Playwright script is provided at `take-screenshots.spec.js` that automates all 5 screenshots against a running WordPress instance. Run with:

```bash
WP_BASE_URL=http://localhost:8889 npx playwright test take-screenshots.spec.js
```

Screenshots are saved to `implementation/WOOPTP-155/screenshots/`.
