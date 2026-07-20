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
