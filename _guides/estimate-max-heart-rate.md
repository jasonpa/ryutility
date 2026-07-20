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
