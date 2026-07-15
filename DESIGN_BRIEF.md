# Currency Converter — Design Brief

## The job

A traveller in Vietnam sees a price on a menu, a sign, or a tuk-tuk driver's phone.
They want to know what it costs in rand, in about a second, standing up, one-handed,
possibly with no signal.

That's the whole app. Everything below serves that.

Secondary job: adding up a bill before paying it.

## Who

One user, South African, on a trip to Vietnam. Not a finance app, not a budget tracker,
not an expense log. No accounts, no sync, no onboarding.

## Currencies

Three, fixed:

| Code | Name | Role |
|---|---|---|
| ZAR | South African Rand | **Home** — what things get compared *to* |
| USD | US Dollar | Foreign — hotels, tours and dive shops quote in dollars |
| VND | Vietnamese Dong | Foreign — everything else |

All three are on screen at once. All three are editable. No from/to picker — with three
currencies a picker is pure friction.

"Home" only decides which direction the helper text reads. It doesn't restrict editing.

Currency switching is explicitly **out of scope** for v1.

## Data

- **Source:** `https://open.er-api.com/v6/latest/ZAR` — keyless, free, no monthly quota.
- **Attribution is required** by their terms. A link reading `Rates By Exchange Rate API`
  to `https://www.exchangerate-api.com`. They explicitly permit it being discreet and
  styled to match the app, so: one quiet line on an about/info screen.
- **Updates once per day.** This is fine. The dong is a managed currency and barely moves;
  the rand is floating but never moves enough overnight to change whether you buy the coffee.
- **The response tells us when to refresh.** It includes `time_next_update_unix`. Store it
  with the rates. On app open: if now is past that timestamp *and* there's a network, fetch.
  Otherwise use cache. That's ~30 requests a month. No background worker, no polling, no TTL guessing.

### Offline is a first-class state, not an error state

The user will be on patchy roaming. Therefore:

- The app **never blocks on the network.** It renders from cache instantly and refreshes underneath.
- Offline, HTTP 429, airplane mode, dead SIM — all one code path: keep using the last known
  rates, keep working.
- Show a quiet `Rates from 14 Jul` line. Not a warning. Not a banner. Not red. Stale rates are
  harmless here and the UI shouldn't imply otherwise.
- First-ever launch with no network is the only genuinely broken state. Ship with a bundled
  fallback rate so even that renders something.

## Sample data for mockups

Real rates as of 14 Jul 2026 — use these so the numbers look right:

- 1 ZAR = 1,588.02 VND
- 1 USD = 26,009 VND
- 1 USD = 16.38 ZAR

Reference values:

| VND | ZAR | USD |
|---|---|---|
| 10,000 | R6.30 | $0.38 |
| 20,000 | R12.59 | $0.77 |
| 50,000 | R31.49 | $1.92 |
| 100,000 | R62.97 | $3.84 |
| 200,000 | R125.94 | $7.69 |
| 500,000 | R314.86 | $19.22 |

## Core interaction

Three fields, live sync. Type in any one, the other two update as you type. The field you're
editing is visibly the source; the other two are visibly derived.

## Input: draw BOTH of these

The client wants to see both drawn and will pick. They may also want both shipped — they serve
genuinely different jobs. Don't merge them into a compromise.

### Model A — the thousands numpad

The insight: **Vietnamese prices are already written in thousands.** A menu says `95` or `95k`,
meaning 95,000 dong. Nobody writes the zeros.

So the dong field's native unit is thousands. You type `9`, `5` → 95,000 VND → R59.82. Two taps,
and it matches the glyphs printed in front of you.

- A `k` indicator so it's never ambiguous what you've entered.
- An escape hatch to exact dong for the rare case you need it.
- k-mode is for dong only. The rand and dollar fields take plain numbers.

Best for: reading one price off a menu.

### Model B — the banknote accumulator

The insight: **make the buttons the actual money.** Vietnamese notes are
1k, 2k, 5k, 10k, 20k, 50k, 100k, 200k, 500k. The pad is exactly that set — so it stops being an
arbitrary list of round numbers and becomes the wallet in your pocket. You tap what you're holding.

- Tapping adds. `50k 50k 50k 25k` builds up a bill.
- **Show the running expression** — `50k + 50k + 50k + 25k = 175,000`.
- **Backspace removes the last _item_, not the last digit.** This is what makes it honest: you can
  undo one wrong tap without retyping the lot.
- Every tap updates the rand and dollar figures live.

Best for: adding up a bill. Also quietly useful because the 20k and 500k notes are both blue-ish
polymer and get confused constantly — a pad shaped like the notes builds the right mental model.

### If both ship

The pad belongs to **whichever field has focus.** Tap the dong field, get dong notes. Tap the rand
field, get rand notes (10/20/50/100/200). Obvious in conversation, easy to lose in a mockup.

## The reference table

Always visible, no interaction. The rows from the sample data above — 10k through 500k in rand.
Most price checks should be answerable by *looking*, without touching anything.

## The rule of thumb

Computed from the live rate, displayed prominently:

> **1,000₫ ≈ R0.63** — drop three zeros, take about two-thirds.

So 95k → about R60.

This is the most important element on the screen and it's easy to mistake for decoration. The
reference table gets you one lookup. The rule of thumb means that after three days in the country
**you stop opening the app at all.** That's the win. Design it like it matters.

## Formatting and rounding

- **Dong always gets thousand separators.** `1500000` is unreadable; `1,500,000` is fine.
- **Round the rand and dollar hard.** `R60`, not `R60.34`. False precision on a street snack makes
  you read digits that don't matter. Whole rand under R100; two decimals above.
- Dollars: two decimals under $10, whole dollars above.

## Non-goals

Say no to these:

- Home screen widget (dropped — revisit after the trip)
- Card/ATM markup toggle (dropped for v1)
- Currency switching / other countries (dropped for v1)
- Historical charts, rate alerts, expense tracking, accounts, sync

## Tech

- React Native via **Expo** — no native modules needed once the widget is out.
- Android only. Sideloaded to the user's phone via Android Studio.
- Rates cached on device; app is fully functional offline.
- Keep the dong denominations, reference values and rule-of-thumb constants in **one file**.
  Nothing else will read it in v1 — the point is that when this app gets pointed at Thailand
  next year, the Vietnam assumptions are in one place instead of scattered through components.

## Tone

Fast, calm, glanceable, high contrast, big numbers. It gets used outdoors in daylight, one-handed,
while someone waits for you to pay. It is not a fintech dashboard.
