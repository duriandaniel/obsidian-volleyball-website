# UX / Content Review — Parent & Player Lens

> Findings from a full-site review on 2026-06-22 (parent + player perspective).
> **Not yet actioned.** Verify each before fixing — some may be intentional.
> When you pick one up, tick it and note the resolution.

## 🔴 Likely inconsistencies / bugs — verify first (these hit trust at checkout)

- [ ] **Trial price contradicts itself.** Home + `/term-programs` + FAQ say **"$25 trial"**, but the trial booking buttons render **"BOOK · FREE"** / **"BOOK · $29"** (per-venue `trialPriceCentsForVenue`). Pick one story or state the per-venue logic explicitly.
- [ ] **Jersey is $36 everywhere except checkout.** Shop page, homepage, FAQ say **$36**; the booking add-on charges **$35** (`CAMP_JERSEY_CENTS`). Align them — a $1 mismatch at payment makes careful parents pause.
- [ ] **Thank-you page is hardcoded to camps / Baulkham Hills.** EVERY booking (incl. a 90-min Kellyville term class) lands on a confirmation that says *"Lunch and snacks for full-day camps"* and shows the Baulkham Hills address. Most jarring flow bug. Make it dynamic to the booking (venue, time, what-to-bring).
- [ ] **Adult sessions name/schedule mismatch.** `/adult-sessions` says "Tue/Wed/Fri 7–9 PM"; booking hub labels it "Social Scrim"; no schedule shown until deep in booking. Align name + nights.

## 🟠 Parent-perspective gaps

- [ ] **No dates anywhere.** Biggest gap. Pages say "every NSW school holiday period" / "every Friday" but never show term start, next camp dates, or enrolment deadlines. "When does it start?" is the #1 parent question and is unanswerable without entering the funnel.
- [ ] **"What actually happens in a session?"** No typical-session breakdown (warm-up → skills → game), no real session photos/video beyond hero, no concrete group-size number (FAQ says ratios "vary by level" — give a number, e.g. "max 10 per coach").
- [ ] **Safety reassurance thin.** WWCC mentioned (good) but nothing on first aid / injury response. Matters for a contact sport with under-12s.
- [ ] **No social proof.** Zero parent testimonials or player outcomes. Coach credentials carry all the trust load. 2–3 genuine quotes would beat another suburb page.
- [ ] **Refund / makeup policy vague.** "Case by case" — parents paying a full term upfront want: how many makeups, do they expire, what about holidays.
- [ ] **Multiple booking entry points.** `/book` → `/booking`; `/booking/term` → `/booking/term/junior`. Works, but bookmarks/shared links land inconsistently. Consider one canonical path.
- [ ] **West Ryde has no precise street address** anywhere (only "West Ryde, NSW"). Kellyville + Baulkham Hills do. First-time parents need the actual address.

## 🟡 Player-perspective gaps

- [ ] **Pathway story front-loads "2027" SVL teams** with no selection criteria — reads as "nothing for me now" to a keen teen. Bridge it: what does a player do *this term* to be on track?
- [ ] **Levels described to parents, not players.** No "which level am I?" self-check a kid can read.
- [ ] **Reels are the best player-facing asset and they're buried** mid-homepage. Most persuasive content for a teen — give it prominence + more game footage (not just drills).

## 💡 Ideas (not urgent)

- Live "next dates" strip (term start / next camp) on home + venue pages.
- Sibling / multi-class discount — none exists; Hills families often have 2+ kids.
- Thin SEO pages: 15 of 24 suburb pages are drive-time-only boilerplate (doorway-page risk). Enrich the high-value ones or consolidate.

## Suggested priority order

1. Trial + jersey price inconsistencies (trust at payment)
2. Dynamic / corrected thank-you page (wrong info to every non-camp booker)
3. Add term/camp **dates** (#1 unanswered parent question)
4. 2–3 parent testimonials (highest-leverage trust add)
5. Session breakdown + group-size numbers
6. Safety/injury reassurance + clearer makeup policy
