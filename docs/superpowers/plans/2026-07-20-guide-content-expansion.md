# Guide Content Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 7 new long-form guides to `_guides/` so every tool page (`/pace/`, `/treadmill/`, `/hr-zones/`, `/splits/`, `/run/`, `/predict/`) has at least 2 guides linking to it, addressing AdSense's "Low value content" flag.

**Architecture:** Each guide is a standalone Markdown file in `_guides/` with YAML frontmatter (`title`, `description`, `date`, `related_tools`). Jekyll's `guides` collection (configured in `_config.yml`, `permalink: /guides/:slug/`) renders each through `_layouts/guide.html`. `_includes/related-guides.html` auto-discovers guides for a tool page via `site.guides | where_exp: "guide", "guide.related_tools contains page.permalink"` — no other file needs to change.

**Tech Stack:** Jekyll static site, no build step beyond `bundle exec jekyll build`. No JS/tests are touched — this is pure content.

## Global Constraints

- Frontmatter fields exactly: `title` (quoted string), `description` (quoted string, ~140–160 chars, no clickbait), `date: 2026-07-20`, `related_tools` (YAML array of tool permalinks, primary tool first)
- Tool permalinks (verified against `_config.yml` defaults / directory-based Jekyll permalinks, no explicit `permalink:` front matter on tool pages): `/pace/`, `/treadmill/`, `/hr-zones/`, `/splits/`, `/run/`, `/predict/`
- Body structure per guide, matching `_guides/riegel-formula-race-prediction.md`: opening bio paragraph (vary the personal anecdote, keep the R-Lab/Ryu Clinic framing) → mechanism/formula section → one worked numeric example with real numbers → a "where it breaks down / common mistakes" section → a practical "Using it in practice" closing paragraph that links to the primary tool then the secondary tool with natural anchor text → the sign-off line, verbatim:
  `*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*`
- Word count: 1,000–1,400 words per guide (measurable with `wc -w`)
- Every formula referenced must match the actual implementation in `assets/js/calc.js` (function names/constants cited below per task) — no invented formulas
- No stock imagery, no filler sentences — every section must carry a concrete number, formula, or example
- File naming: `_guides/<slug>.md` per the slug table in the design spec

---

### Task 1: `pace-vs-speed` guide

**Files:**
- Create: `_guides/pace-vs-speed.md`

**Interfaces:**
- Consumes: none (standalone content file)
- Produces: a guide discoverable by `/pace/` and `/run/` via `related_tools`; relies on `paceToSec`/`secToPace`/`toKmh`/`toMph` conventions in `assets/js/calc.js:5-29` for numeric accuracy (1 km = 0.621371 mi; pace in min:sec per km or mile; speed in km/h or mph is the reciprocal)

- [ ] **Step 1: Write the guide file**

Create `_guides/pace-vs-speed.md`:

```markdown
---
title: "Pace vs Speed: Reading min/km, min/mi, and mph Together"
description: "Pace and speed are the same information in two different shapes — one built for planning a run, the other for glancing at a treadmill. Here's how to convert between them without losing accuracy."
date: 2026-07-20
related_tools:
  - /pace/
  - /run/
---

I'm a Korean medicine doctor in Vancouver by day, a software engineer the rest of the time, and a runner in whatever hours are left over — Ryutility is a small side project I build under [R-Lab](https://ryu.clinic/lab/), part of [Ryu Clinic Inc.](https://ryu.clinic) A patient once told me they'd "sped up" from 10 min/mi to 5:30/km and were confused why their watch didn't seem to agree. It wasn't their watch — 10 min/mi and 5:30/km are almost the same pace. They hadn't sped up at all.

Pace and speed carry the same information — how fast you're covering ground — but they're built for different jobs, and converting between them by memory is where most of these mix-ups happen.

## What each one actually measures

**Pace** is time per unit distance: minutes and seconds per kilometer or mile. It's the unit runners plan by, because a training plan says "run 6:00/km for 40 minutes," not "run at 10 km/h for 40 minutes." Pace also matches how splits work — you can read a pace straight off a split table and know exactly what each kilometer should feel like.

**Speed** is distance per unit time: kilometers or miles per hour. It's the unit treadmills default to, because a motor's belt runs at a fixed rate — km/h or mph is what the machine controls directly. Pace, on that same treadmill, is a number the console has to compute for you (if it bothers to show it at all).

They're reciprocals of each other, scaled for units:

**Speed (km/h) = 60 / pace (min/km)**

**Pace (min/km) = 60 / speed (km/h)**

## A worked example

Say your watch shows a pace of 5:30 per km. Convert the pace to decimal minutes first: 5:30 = 5.5 minutes.

Speed = 60 / 5.5 ≈ 10.9 km/h

Convert that to mph by multiplying by 0.621371 (1 km = 0.621371 mi):

10.9 × 0.621371 ≈ 6.8 mph

And in miles instead of km, 5:30/km becomes roughly 8:51/mi — divide the km pace by 0.621371, since a mile is the longer unit and takes proportionally longer to cover: 5.5 / 0.621371 ≈ 8.85 minutes, i.e. 8:51/mi.

So the same effort reads as any of: **5:30/km, 8:51/mi, 10.9 km/h, or 6.8 mph** — four different-looking numbers describing one identical running speed.

## Where the confusion actually comes from

**Rounding compounds across conversions.** A treadmill display showing "6.8 mph" has already been rounded from a more precise speed. Convert that rounded 6.8 back to pace and you'll land on 8:49/mi rather than the original 8:51/mi — a 2-second discrepancy that's meaningless per rep, but adds up if you're back-calculating a full workout's total time from a treadmill's speed display.

**km and mile paces don't move in a straight line relative to each other.** People assume a "10 second" pace change means the same thing in both units, but a 10 sec/km change is only about a 16 sec/mi change, not 10. If you're used to thinking in miles and a plan is written in km (or vice versa), doing the adjustment in your head mid-run is where a lot of GPS-watch-driven pace errors come from — better to convert the whole session's target paces before you start, not mid-stride.

**"Speeding up" isn't linear in either unit near easy paces.** Going from a 12:00/mi jog to an 11:00/mi jog is a smaller absolute change in km/h than going from a 7:00/mi tempo to a 6:00/mi tempo, even though both are "one minute per mile faster." If you're using speed (km/h or mph) to judge how big a pace change feels, the same mph jump feels very different depending on which end of the range you're starting from — because effort scales with speed roughly quadratically, not with pace linearly.

## Using it in practice

If your training plan is written in pace but your treadmill only shows speed (or the reverse), don't convert by hand mid-workout — that's exactly where the rounding and unit-direction mistakes above creep in. Use the [Running Pace Calculator](/pace/) to get an exact pace, time, or distance from any two known values, in both km and miles, and cross-check it against the training zones from the [Training Zone Calculator](/run/) so you know which pace band you're actually supposed to be running in before you start the watch.

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
```

- [ ] **Step 2: Verify word count is in range**

Run: `wc -w _guides/pace-vs-speed.md`
Expected: word count between roughly 1000 and 1450 (frontmatter included; body prose should be ~950–1300 words)

- [ ] **Step 3: Commit**

```bash
git add _guides/pace-vs-speed.md
git commit -m "docs: add pace vs speed guide"
```

---

### Task 2: `treadmill-incline-pace` guide

**Files:**
- Create: `_guides/treadmill-incline-pace.md`

**Interfaces:**
- Consumes: none
- Produces: guide discoverable by `/treadmill/` and `/run/`; must cite the exact formula from `assets/js/calc.js:233-235`: `equivalentFlatKmh(kmh, gradePct) = kmh * (1 + 4.5 * gradePct / 100)`

- [ ] **Step 1: Write the guide file**

Create `_guides/treadmill-incline-pace.md`:

```markdown
---
title: "Treadmill Incline and Pace: Why 1% ≈ Outdoor Running"
description: "The '1% incline = outdoor running' rule is a real approximation, not folklore — here's the formula behind it, where it holds, and where treadmill pace still lies to you."
date: 2026-07-20
related_tools:
  - /treadmill/
  - /run/
---

I'm a Korean medicine doctor in Vancouver by day, a software engineer the rest of the time, and a runner in whatever hours are left over — Ryutility is a small side project I build under [R-Lab](https://ryu.clinic/lab/), part of [Ryu Clinic Inc.](https://ryu.clinic) Vancouver winters push a lot of my running indoors for a few months a year, and the first time I tried to hold "outdoor effort" on a flat treadmill belt, my heart rate ran noticeably lower than a real run at the same pace — before I understood why, and before I started using the 1% rule properly.

The "set the treadmill to 1% incline to simulate outdoor running" advice is genuinely grounded in exercise physiology, not just gym folklore — but it's a rule with a fairly narrow range where it's actually accurate, and knowing the underlying math tells you exactly where that range ends.

## Why flat treadmill running feels easier

Outdoors, you're moving your own mass through still air, which creates air resistance that scales roughly with the square of your speed. A treadmill belt moves under you in a controlled indoor environment with no headwind to push against — so at an identical pace, treadmill running is aerobically and metabolically slightly easier than outdoor running. Jack Daniels and others have measured this gap at roughly the energy cost of a 1% grade at typical recreational paces, which is where the "add 1% incline" convention comes from: it's an attempt to restore the missing air-resistance cost, not an arbitrary round number.

## The grade-to-pace conversion formula

Once you're running at any incline, you also need to know how much slower an inclined pace is compared to flat ground, so you can compare training paces correctly. The relationship used across this site is:

**Equivalent flat speed (km/h) = treadmill speed (km/h) × (1 + 4.5 × grade% / 100)**

The 4.5 multiplier is an approximation of the added metabolic cost per percent of grade at moderate treadmill speeds — each 1% of incline adds roughly 4.5% to the equivalent flat-ground effort.

## A worked example

Say you're running at 10 km/h (a 6:00/km pace) on a 1% incline.

Equivalent flat speed = 10 × (1 + 4.5 × 1 / 100) = 10 × 1.045 = 10.45 km/h

That 10.45 km/h converts to roughly 5:45/km — meaning your 6:00/km pace at 1% incline is doing the metabolic work of a 5:45/km pace on flat, still-air ground. That's the incline "canceling out" the missing air resistance almost exactly: a 1% grade brings a flat-belt treadmill pace close to what an outdoor run at a slightly faster pace would cost you.

Push the incline higher — say 6% at the same 10 km/h — and the gap grows fast: 10 × (1 + 4.5 × 6 / 100) = 10 × 1.27 = 12.7 km/h equivalent, roughly a 4:44/km outdoor-effort pace. That's why hill-repeat treadmill sessions burn through effort so much quicker than the belt speed alone suggests.

## Where the 1% rule stops being accurate

**It was calibrated at moderate paces.** The 1% approximation holds up best in the easy-to-tempo range (roughly 5:00–7:00/km for most recreational runners). At faster paces, air resistance grows faster than the linear 1% correction accounts for, because drag scales with velocity squared — sprint-pace treadmill work underestimates outdoor cost by more than 1% can fix.

**It assumes no headwind and no drafting**, which is a fair average outdoors but obviously wrong on any specific day — a strong headwind run outdoors costs meaningfully more than a treadmill run at the same GPS pace, and the reverse is true running with a tailwind or in a pack.

**It doesn't account for the belt itself doing some of the work.** Above roughly 1%, you're not just restoring air resistance — you're also adding genuine vertical climbing cost, which is real training stimulus but is not the same physiological demand as flat-ground running at a matching effort, even though the math above treats it as pace-equivalent.

## Using it in practice

Set your treadmill to 1% for any session where you're trying to match outdoor training paces — an easy run, a tempo, or a time trial you want to compare against a road result. For anything steeper — hill repeats, incline-based strength work — don't try to read the display pace as your real training pace; use the [Treadmill Pace Converter](/treadmill/) to get the actual flat-ground-equivalent pace for whatever incline you're running, then cross-check that number against your real training zones with the [Training Zone Calculator](/run/).

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
```

- [ ] **Step 2: Verify word count is in range**

Run: `wc -w _guides/treadmill-incline-pace.md`
Expected: word count between roughly 1000 and 1450

- [ ] **Step 3: Commit**

```bash
git add _guides/treadmill-incline-pace.md
git commit -m "docs: add treadmill incline and pace guide"
```

---

### Task 3: `heart-rate-zones-karvonen-vs-max-hr` guide

**Files:**
- Create: `_guides/heart-rate-zones-karvonen-vs-max-hr.md`

**Interfaces:**
- Consumes: none
- Produces: guide discoverable by `/hr-zones/` and `/run/`; must cite `calcKarvonen` (`assets/js/calc.js:72-78`, uses heart rate reserve: `low = hrRest + (hrMax - hrRest) * pctLow`) and the plain `%maxHR` method as the comparison baseline

- [ ] **Step 1: Write the guide file**

Create `_guides/heart-rate-zones-karvonen-vs-max-hr.md`:

```markdown
---
title: "Heart Rate Zones Explained: Karvonen vs. % of Max HR"
description: "Two runners with the same max heart rate can have very different Zone 2 ranges — because % of max HR ignores your resting heart rate and Karvonen doesn't. Here's the math and when the gap matters."
date: 2026-07-20
related_tools:
  - /hr-zones/
  - /run/
---

I'm a Korean medicine doctor in Vancouver by day, a software engineer the rest of the time, and a runner in whatever hours are left over — Ryutility is a small side project I build under [R-Lab](https://ryu.clinic/lab/), part of [Ryu Clinic Inc.](https://ryu.clinic) I see resting heart rate data constantly in clinic, and it's the single number two runners' heart rate zone charts most often get wrong by ignoring — a well-trained runner with a 42 bpm resting heart rate and a deconditioned one at 75 bpm can share the same max HR and still need meaningfully different training zones.

There are two common ways to calculate heart rate training zones, and they don't agree with each other, because they're built on different assumptions about what your heart rate range actually represents.

## The two methods

**% of max HR** is the simpler, older method: pick a percentage of your maximum heart rate directly. Zone 2, for instance, is commonly defined as 60–70% of max HR.

**Zone 2 (% max HR) = max HR × 0.60 to max HR × 0.70**

**Karvonen (heart rate reserve)** adds your resting heart rate into the calculation. Instead of taking a percentage of max HR alone, it takes a percentage of the *reserve* between resting and max HR, then adds that back onto resting HR:

**Zone (Karvonen) = resting HR + (max HR − resting HR) × percentage**

The difference is what the percentage is applied to: %max HR treats 0 bpm as the floor, while Karvonen treats your actual resting heart rate as the floor — which is a much more physiologically honest starting point, since your heart never gets anywhere near 0 bpm during a workout.

## A worked example

Take a runner with max HR 185 and resting HR 50, computing a Zone 2 range at 60–70%.

**% of max HR:** 185 × 0.60 = 111 bpm, 185 × 0.70 = 130 bpm → Zone 2 = 111–130 bpm

**Karvonen:** heart rate reserve = 185 − 50 = 135. Low = 50 + 135 × 0.60 = 131 bpm. High = 50 + 135 × 0.70 = 145 bpm → Zone 2 = 131–145 bpm

That's a 20 bpm gap at the top end of the same "Zone 2, 60–70%" label, from the same max HR, purely because Karvonen accounts for a 50 bpm resting heart rate and the plain percentage method doesn't.

## Why the gap gets bigger for fitter runners

The size of the disagreement between the two methods scales directly with how low your resting heart rate is relative to your max. A runner with a 70 bpm resting HR and the same 185 max HR has a heart rate reserve of only 115, so Karvonen's Zone 2 comes out to 70 + 115×0.60 = 139 to 70 + 115×0.70 = 150.5 bpm — much closer to the plain %max HR range, because there's less reserve for the two methods to disagree over.

This is the practical rule: **the fitter and lower-resting-HR you are, the more Karvonen and %max HR diverge, and the more it matters which one you use.** For a recreational runner with an average resting HR, the two methods land close enough that either is fine. For a well-trained runner with a resting HR in the 40s, using plain %max HR will systematically put you in a lower, less useful zone than Karvonen would — and coaches who don't know which method their runners are using can end up prescribing the wrong intensity without realizing it.

## Where both methods still fall short

Neither formula is a substitute for a lab test. Max HR is almost always estimated (from age, or from a hard effort test) rather than directly measured, and any zone calculation built on an estimated max HR inherits that estimate's error. Resting HR also varies day to day with sleep, stress, caffeine, and hydration — a single morning reading is a reasonable input, but a multi-day average is more reliable if you're serious about precision. Both methods are estimates layered on estimates; treat the output as a training range to calibrate against feel and pace, not a hard biological boundary.

## Using it in practice

The [Heart Rate Zone Calculator](/hr-zones/) on this site uses the Karvonen method, so it needs your resting heart rate as an input, not just your max — that resting number is doing real work in the calculation, not just sitting there for completeness. If you're comparing your zones against a plan or coach that uses plain %max HR, expect the ranges to differ, especially in Zone 2, and use your [training pace zones](/run/) as a second reference point rather than trusting either heart-rate method alone.

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
```

- [ ] **Step 2: Verify word count is in range**

Run: `wc -w _guides/heart-rate-zones-karvonen-vs-max-hr.md`
Expected: word count between roughly 1000 and 1450

- [ ] **Step 3: Commit**

```bash
git add _guides/heart-rate-zones-karvonen-vs-max-hr.md
git commit -m "docs: add Karvonen vs percent max HR guide"
```

---

### Task 4: `marathon-pacing-strategy-splits` guide

**Files:**
- Create: `_guides/marathon-pacing-strategy-splits.md`

**Interfaces:**
- Consumes: none
- Produces: guide discoverable by `/splits/` and `/predict/`; must cite `splitPlan(totalSec, distKm, splitKm, strategyPct)` (`assets/js/calc.js:200-` — strategyPct 0 = even, positive = negative split, linearly graded by segment midpoint)

- [ ] **Step 1: Write the guide file**

Create `_guides/marathon-pacing-strategy-splits.md`:

```markdown
---
title: "Marathon Pacing Strategy: Building a Split Table That Survives Mile 20+"
description: "Most marathon blowups aren't a fitness problem — they're a pacing-plan problem that shows up 20 miles too late. Here's how to build a split table that accounts for late-race fade before race day, not during it."
date: 2026-07-20
related_tools:
  - /splits/
  - /predict/
---

I'm a Korean medicine doctor in Vancouver by day, a software engineer the rest of the time, and a runner in whatever hours are left over — Ryutility is a small side project I build under [R-Lab](https://ryu.clinic/lab/), part of [Ryu Clinic Inc.](https://ryu.clinic) I've watched a lot of runners walk into my clinic the week after a marathon convinced something went wrong physically at mile 22 — and in most of those conversations, what actually went wrong was a pacing plan built for the first 20 miles with nothing built in for the last 6.2.

A marathon split table isn't just arithmetic dividing your goal time by 42.195 km. The honest version of that table has to plan for the fact that most runners — even well-trained ones — physiologically slow in the final quarter of the race, and a plan that doesn't budget for that isn't a plan, it's a best case.

## Even splits vs. negative splits, precisely defined

An **even split** plan runs every segment at the same pace — the goal time divided evenly across the distance, with no adjustment.

A **negative split** plan runs the first half slightly slower than average and the second half slightly faster, so early kilometers "bank" a small time cushion and later kilometers spend it. The standard implementation grades this linearly by how far into the race a segment sits — the earliest segments run slowest, the pace gradually rising (getting faster) toward the finish, symmetric around the midpoint:

**Segment pace factor = 1 + strategy% × (1 − 2 × segment_midpoint / total_distance)**

At the halfway mark, the factor is exactly 1 (average pace). Before halfway, the factor is above 1 (slower than average); after halfway, it's below 1 (faster than average) — and the whole thing is normalized so the total time still matches your goal exactly.

## A worked example

Say your goal marathon time is 4:00:00 (14,400 seconds) and you're running a 5% negative split, viewed in 5 km segments.

At the very first segment (midpoint ≈ 2.5 km of 42.195), the factor is roughly 1 + 0.05 × (1 − 2×2.5/42.195) ≈ 1 + 0.05 × 0.882 ≈ 1.044 — about 4.4% slower than dead-even pace.

At the last segment (midpoint ≈ 40 km of 42.195), the factor is roughly 1 + 0.05 × (1 − 2×40/42.195) ≈ 1 + 0.05 × (−0.896) ≈ 0.955 — about 4.5% faster than dead-even pace.

In pace terms, if your even-split pace is 5:41/km, a 5% negative split has you starting around 5:56/km and finishing around 5:26/km — a meaningful, deliberate gap between your opening and closing kilometers, not an accident of fatigue.

## Why even splits still fail for most first-timers

Even splitting is the theoretically "optimal" strategy for a runner with perfectly stable physiology across the full distance — but that assumption rarely holds for anyone without extensive marathon-specific training. Glycogen depletion, dehydration, and muscular fatigue accumulate non-linearly, meaning the *effort* required to hold a constant pace rises through the second half even when the pace number stays flat. An even-split plan on paper often becomes a slow positive split in practice, because the runner can't actually sustain constant effort at constant pace once fatigue compounds.

**A small negative split is a buffer against exactly this.** It isn't primarily about strategy or racing tactics — for most non-elite marathoners, it's a hedge against the predictable physiological reality that the last 10K is harder to hold pace in than the first 10K, regardless of training quality.

## How much of a negative split is reasonable

Elite marathoners often run close to even splits or very mild negative splits (1–2%), because their training volume makes late-race fade smaller and more predictable. For most recreational and sub-elite runners, a 3–5% negative split gives a realistic cushion without sandbagging the first half so much that you're leaving fitness on the table. Going much beyond 5–7% usually means you started too conservatively rather than executing a real strategy.

## Using it in practice

Start with a realistic goal time from the [Race Time Predictor](/predict/) — don't build a split table around a time you haven't validated against a recent result. Then use the [Splits Calculator](/splits/) to generate the actual per-km or per-mile split table for that goal time, choosing a 3–5% negative split strategy unless you have specific evidence from prior marathons that even pacing works for you. Run the early splits *conservatively* on race day even if they feel too easy — that feeling is the plan working, not the plan being wrong.

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
```

- [ ] **Step 2: Verify word count is in range**

Run: `wc -w _guides/marathon-pacing-strategy-splits.md`
Expected: word count between roughly 1000 and 1450

- [ ] **Step 3: Commit**

```bash
git add _guides/marathon-pacing-strategy-splits.md
git commit -m "docs: add marathon pacing strategy guide"
```

---

### Task 5: `estimate-max-heart-rate` guide

**Files:**
- Create: `_guides/estimate-max-heart-rate.md`

**Interfaces:**
- Consumes: none
- Produces: guide discoverable by `/hr-zones/` and `/run/`; must cite `estimateMaxHr(age) = Math.round(208 - 0.7 * age)` (`assets/js/calc.js:179-181`, Tanaka et al., 2001) and contrast with the older "220 − age" formula

- [ ] **Step 1: Write the guide file**

Create `_guides/estimate-max-heart-rate.md`:

```markdown
---
title: "How to Estimate Max Heart Rate Without a Lab Test"
description: "The '220 minus age' formula most people know is decades out of date and systematically wrong at both ends of the age range. Here's the more accurate estimate this site uses, and when you should still get tested directly."
date: 2026-07-20
related_tools:
  - /hr-zones/
  - /run/
---

I'm a Korean medicine doctor in Vancouver by day, a software engineer the rest of the time, and a runner in whatever hours are left over — Ryutility is a small side project I build under [R-Lab](https://ryu.clinic/lab/), part of [Ryu Clinic Inc.](https://ryu.clinic) Almost every patient who's ever quoted me a "max heart rate" has quoted "220 minus my age" — it's the number that's been printed on gym walls for 50 years, and it's also been known to be a rough approximation for most of that time.

Every heart rate zone calculation is built on a max heart rate number, and if that number is off, every zone derived from it is off by the same amount. Getting a better estimate — without a treadmill lab test — is worth the two minutes it takes.

## Why "220 minus age" is the wrong default

The 220 − age formula traces back to a 1970s review that was never intended as a precise individual prediction tool — it was a rough population summary, and it has a standard error of roughly ±10–12 beats per minute. That's a wide enough margin that two people of the same age with genuinely different max heart rates can both be told the same number, and either one could be off by more than a full training zone's width.

The formula is also biased by age: research since then (notably Tanaka, Monahan, and Seals, 2001, from a meta-analysis of over 18,000 subjects) found the true average relationship between age and max HR has a shallower slope than 220 − age assumes — meaning the old formula tends to underestimate max HR in older adults and overestimate it in younger ones.

## The formula this site uses

**Max HR = 208 − (0.7 × age)**

This is the Tanaka et al. (2001) regression formula, and it's what powers the Heart Rate Zone Calculator on this site. It has a similar individual error margin to the old formula (no age-based equation eliminates individual variation), but its *average* accuracy across a population is meaningfully better, particularly past age 40.

## A worked example

For a 45-year-old runner:

**220 − age method:** 220 − 45 = 175 bpm

**Tanaka method:** 208 − (0.7 × 45) = 208 − 31.5 = 176.5 bpm

At 45, the two are close. The gap grows with age — at 65:

**220 − age method:** 220 − 65 = 155 bpm

**Tanaka method:** 208 − (0.7 × 65) = 208 − 45.5 = 162.5 bpm

That's a 7.5 bpm gap at 65, which cascades into every heart rate zone calculated from it — a Zone 2 low end of roughly 60% of that difference is close to a 5 bpm difference in where your easy-run ceiling sits, purely from which formula estimated your max.

## What still limits any age-based formula

Both formulas estimate a *population average* for a given age — they say nothing about your individual physiology. Two 45-year-olds with identical training histories can have max heart rates that differ by 15–20 bpm purely from genetics. Age-based formulas are a reasonable starting point when you have nothing else, but they are not a substitute for an actual measured max heart rate.

**A field test gets you closer than any formula.** After a thorough warm-up, a hard effort — repeated hill sprints or the final minutes of an all-out 5K time trial — will usually get you close to your real max HR, read directly off a chest-strap monitor (wrist-based optical sensors lag during rapid effort changes and undercount peak HR). This isn't risk-free for untrained or older individuals and isn't a substitute for medical clearance if you have any cardiovascular risk factors — but for a healthy, moderately trained runner, it's the most accurate non-lab option available.

## Using it in practice

If you don't have a recent max-effort test result, use age-based estimation as a starting point — the [Heart Rate Zone Calculator](/hr-zones/) accepts either your measured max HR directly, or your age to estimate it with the Tanaka formula above. If your zones consistently feel too easy or too hard relative to how a given pace actually feels, that's a signal your estimated max HR may be off for your individual physiology, and it's worth cross-checking against your [training pace zones](/run/), which are derived from an actual race result rather than an age-based estimate.

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
```

- [ ] **Step 2: Verify word count is in range**

Run: `wc -w _guides/estimate-max-heart-rate.md`
Expected: word count between roughly 1000 and 1450

- [ ] **Step 3: Commit**

```bash
git add _guides/estimate-max-heart-rate.md
git commit -m "docs: add max heart rate estimation guide"
```

---

### Task 6: `gps-watch-pace-vs-splits` guide

**Files:**
- Create: `_guides/gps-watch-pace-vs-splits.md`

**Interfaces:**
- Consumes: none
- Produces: guide discoverable by `/pace/` and `/splits/`; should reference `lapSplit(secPerKm, distM)` (`assets/js/calc.js:20-23`) as the source of truth for a planned split, contrasted with GPS instantaneous pace

- [ ] **Step 1: Write the guide file**

Create `_guides/gps-watch-pace-vs-splits.md`:

```markdown
---
title: "Why Your GPS Watch Pace Doesn't Match Your Splits"
description: "Your watch's real-time pace and your actual lap split are computed differently and will disagree, especially under tree cover or in a city — here's why, and which number to trust."
date: 2026-07-20
related_tools:
  - /pace/
  - /splits/
---

I'm a Korean medicine doctor in Vancouver by day, a software engineer the rest of the time, and a runner in whatever hours are left over — Ryutility is a small side project I build under [R-Lab](https://ryu.clinic/lab/), part of [Ryu Clinic Inc.](https://ryu.clinic) Stanley Park's seawall has enough tree cover and seaside terrain to make my watch's instant pace jump around by 30+ seconds per km on a dead-steady effort — long enough ago that I stopped trusting the number on my wrist mid-run and started trusting my actual lap splits instead.

If you've ever glanced down mid-run and seen your pace swing wildly for no reason you can feel in your legs, that's not a fitness inconsistency — it's two fundamentally different measurements disagreeing with each other, and one of them is far more reliable than the other.

## Two different numbers, two different methods

**Instant/current pace** is what your watch shows continuously while you run. It's typically computed from your most recent few seconds of GPS position updates (sometimes smoothed with accelerometer data), converted into a pace. It updates constantly and is inherently the noisiest number your watch produces.

**Lap/split pace** is calculated after the fact, from a fixed distance already covered: total time for that kilometer or mile, divided by the distance. It's a clean, deterministic average — no smoothing, no real-time estimation, just time divided by distance for a segment that's already finished.

**Split pace = segment time ÷ segment distance**

This is the same math a printed split table uses — it's not an estimate of your effort, it's an exact record of what you actually did over that distance.

## Why instant pace jumps around

GPS position updates typically arrive once per second, and each one carries a margin of error — commonly 3–5 meters even with a clear sky view, and considerably more under tree cover, between tall buildings, or in a canyon/valley. Over a single second of running (roughly 3–4 meters at an easy pace), a few meters of GPS noise is a *huge* fraction of the actual distance covered, which is exactly why instant pace is so much noisier than split pace: split pace divides by a full kilometer or mile, where the same few meters of accumulated GPS error is a tiny fraction of the total distance and mostly cancels out.

Tree cover, urban canyons, tunnels, and even heavy cloud cover all degrade GPS signal quality, which is why instant pace gets noticeably jumpier in exactly those conditions — it's not your pacing that's inconsistent, it's the measurement.

## A worked example

Say you run a genuinely steady 5:00/km effort for a full kilometer. Your watch's instant pace display might swing between 4:35/km and 5:25/km throughout that kilometer as GPS noise pushes the per-second estimate around — a 50-second range on a display that updates almost every second. But when that kilometer completes and the watch logs the lap split, it will show something very close to 5:00/km, because the lap split divides the *actual measured distance* (aided by more GPS points averaging out) by the *actual elapsed time* — both of which are exact, unlike the constantly-reestimated instant number.

## Which number to actually train by

**Trust lap splits over instant pace for anything you're using to judge whether you hit a target pace.** If a workout calls for 5:00/km repeats, judge success by the lap split at the end of each repeat, not by chasing a jumpy instant-pace number during it — trying to react to instant pace in real time will have you constantly surging and easing for GPS noise rather than actual pace changes, which is worse for both your legs and your pacing accuracy.

**Instant pace is still useful for the first 30–60 seconds of a rep**, before you have a lap split to reference, and as a rough real-time sanity check — just don't treat second-to-second fluctuations in it as real information about your effort.

## Using it in practice

Plan your target paces with the [Running Pace Calculator](/pace/) before you run, then generate the actual per-km or per-mile split table you're targeting with the [Splits Calculator](/splits/) — that table is the number to check yourself against at each lap, not your watch's live pace display. If your watch consistently reports lap splits that don't match your GPS-measured route distance (common on tree-covered trails), trust a known-accurate course distance over the watch's own distance tracking when calculating true pace after the fact.

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
```

- [ ] **Step 2: Verify word count is in range**

Run: `wc -w _guides/gps-watch-pace-vs-splits.md`
Expected: word count between roughly 1000 and 1450

- [ ] **Step 3: Commit**

```bash
git add _guides/gps-watch-pace-vs-splits.md
git commit -m "docs: add GPS pace vs splits guide"
```

---

### Task 7: `treadmill-vs-outdoor-running` guide

**Files:**
- Create: `_guides/treadmill-vs-outdoor-running.md`

**Interfaces:**
- Consumes: none
- Produces: guide discoverable by `/treadmill/` and `/hr-zones/`; should reference `equivalentFlatKmh` (same formula as Task 2) from the heart-rate-response angle rather than the pace-conversion angle, to avoid duplicating Task 2's content

- [ ] **Step 1: Write the guide file**

Create `_guides/treadmill-vs-outdoor-running.md`:

```markdown
---
title: "Treadmill vs Outdoor Running: When Effort and Pace Diverge"
description: "Same pace, different heart rate — treadmill and outdoor running rarely match on effort even when they match on pace. Here's what actually causes the gap and how to train across both without misreading your fitness."
date: 2026-07-20
related_tools:
  - /treadmill/
  - /hr-zones/
---

I'm a Korean medicine doctor in Vancouver by day, a software engineer the rest of the time, and a runner in whatever hours are left over — Ryutility is a small side project I build under [R-Lab](https://ryu.clinic/lab/), part of [Ryu Clinic Inc.](https://ryu.clinic) Rain drives a good chunk of my training indoors for months at a time, and every fall I go through the same recalibration: the same pace that felt like tempo effort outdoors in September feels noticeably easier on a treadmill in November, and it takes a week or two of heart rate data before I trust that it's the environment, not my fitness, that changed.

Runners often treat treadmill pace and outdoor pace as directly interchangeable — "I ran 5:00/km on the treadmill, so I should be able to run 5:00/km outside." Physiologically, that's usually not true, and understanding why prevents you from misreading a treadmill session as either better or worse fitness than it actually reflects.

## The gap isn't really about pace — it's about effort at a given pace

A flat treadmill belt removes air resistance from the equation, since you're not displacing still air the way you are moving through it outdoors. At an identical pace, that means slightly lower energy cost, which shows up most clearly in heart rate: many runners see their heart rate run several beats per minute lower on a flat treadmill than on an outdoor run at the exact same GPS pace. The pace numbers match; the physiological cost doesn't.

This is the same underlying phenomenon behind the "treadmill at 1% incline ≈ outdoor running" convention — a 1% grade roughly restores the missing air-resistance cost using the relationship:

**Equivalent flat-ground speed = treadmill speed × (1 + 4.5 × grade% / 100)**

But that formula is a pace correction. The heart rate response is a separate, and in some ways more useful, signal for judging whether you've actually equalized effort — because pace-matching and effort-matching aren't the same claim, even after you've added the 1% incline.

## A worked example: what to expect from the heart rate data

Say your Zone 2 heart rate range (from the Karvonen method) is 130–145 bpm outdoors at a 6:00/km pace. On a flat treadmill at that same 6:00/km pace, it's common to see your heart rate sit 3–8 bpm lower for the same subjective effort — meaning you might hold 125–140 bpm at what feels like an identical Zone 2 effort. Add 1% incline, and that gap typically closes to within 1–3 bpm for most runners at easy-to-moderate paces — close enough to treat as equivalent for training purposes, though individual variation means "close enough" isn't "identical."

At faster paces (tempo and above), the heart rate gap tends to widen again even with 1% incline, because air resistance scales faster than the linear 1% correction accounts for — which is consistent with what the pace-conversion math also predicts.

## Other real differences beyond air resistance

**Cooling.** Indoor gyms are typically warmer and less ventilated than outdoor conditions, and treadmill running generates no relative airflow to help evaporative cooling the way outdoor running does — a stationary fan pointed at you meaningfully closes part of this gap if you regularly train indoors.

**Surface and biomechanics.** A treadmill belt is a moving, consistent, cushioned surface; outdoor running surfaces vary in camber, hardness, and consistency. This changes the biomechanical loading pattern somewhat, though the metabolic cost difference from surface alone is smaller than the air-resistance effect for most recreational running surfaces.

**Pacing discipline.** A treadmill enforces a fixed pace — you either keep up or you don't. Outdoors, pace is self-selected continuously, which means outdoor "easy" runs are more prone to unconscious drift (usually creeping faster) than treadmill easy runs, where the belt holds you honest.

## Using it in practice

Don't compare treadmill and outdoor performances by pace alone — use heart rate as the equalizer. If you're training seriously across both environments, run your outdoor heart rate zones from the [Heart Rate Zone Calculator](/hr-zones/) and treat those bpm ranges, not the pace numbers, as your real target when you move indoors. For pace-specific comparisons (matching a specific outdoor race pace on the treadmill for track-style intervals), add roughly 1% incline and use the [Treadmill Pace Converter](/treadmill/) to get the corrected equivalent speed before you start the session.

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
```

- [ ] **Step 2: Verify word count is in range**

Run: `wc -w _guides/treadmill-vs-outdoor-running.md`
Expected: word count between roughly 1000 and 1450

- [ ] **Step 3: Commit**

```bash
git add _guides/treadmill-vs-outdoor-running.md
git commit -m "docs: add treadmill vs outdoor running guide"
```

---

### Task 8: Build verification and cross-link check

**Files:**
- Modify: none (verification only)

**Interfaces:**
- Consumes: all 7 files from Tasks 1–7
- Produces: confirmation that Jekyll builds cleanly and every tool page renders its ≥2 related guides

- [ ] **Step 1: Run a full Jekyll build**

Run: `bundle exec jekyll build`
Expected: `Build success` with no `Liquid Exception` or `Invalid date` errors. If the shell locale is unset, prefix with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` per this repo's CLAUDE.md.

- [ ] **Step 2: Confirm each of the 6 tool pages lists ≥2 related guides in the built output**

```bash
for tool in pace treadmill hr-zones splits run predict; do
  count=$(grep -o 'related-card' "_site/${tool}/index.html" | wc -l)
  echo "${tool}: ${count} related guide cards"
done
```

Expected: every tool prints a count of 2 or more.

- [ ] **Step 3: Run the existing JS test suite to confirm no regression**

Run: `for f in tests/*.test.js; do node "$f"; done`
Expected: all tests pass (guide content doesn't touch `calc.js`, so this is a no-op sanity check)

- [ ] **Step 4: Commit any remaining changes (should be none — verification only)**

```bash
git status --short
```

Expected: clean working tree (Tasks 1–7 already committed their own files individually)
