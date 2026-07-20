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
