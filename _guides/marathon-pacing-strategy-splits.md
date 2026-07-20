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
