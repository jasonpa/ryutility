---
title: "Using the Riegel Formula to Predict Your Next Race Time (and When It's Wrong)"
description: "The Riegel formula is a solid starting estimate for a nearby race distance — and a poor one for predicting a marathon from a 5K. Here's the math and the limits."
date: 2026-07-12
related_tools:
  - /predict/
  - /pace/
---

I'm a Korean medicine doctor in Vancouver by day, a software engineer the rest of the time, and a runner in whatever hours are left over — Ryutility is a small side project I build under [R-Lab](https://ryu.clinic/lab/), part of [Ryu Clinic Inc.](https://ryu.clinic) I made this exact mistake myself years ago: I plugged a strong 5K time into a race predictor, got a marathon number that looked achievable on paper, and found out on the course that a 5K doesn't tell you anything about mile 30.

Race time prediction formulas get treated as more precise than they are. The most common one — the Riegel formula — is genuinely useful, but only within a range it was designed for. Outside that range, it quietly stops being a prediction and starts being a guess with decimal places.

## The formula

Riegel's formula predicts a finish time at a new distance from a known result at another distance:

**T2 = T1 × (D2 / D1)^1.06**

T1 and D1 are your known time and distance, T2 and D2 are the predicted time and target distance, and 1.06 is a fatigue exponent — it captures the fact that pace naturally slows as distance increases, even for a well-trained runner.

## A worked example

Say you ran a 5K in 22:00 and want to predict a 10K.

D2/D1 = 10 / 5 = 2

2^1.06 ≈ 2.085

T2 = 22:00 × 2.085 ≈ 45:52

That's a reasonable, well-supported estimate — 5K to 10K is exactly the kind of gap the formula handles well: both are aerobic-dominant efforts, run at similar training paces, close enough in distance that the same fitness largely transfers.

## Where the formula breaks down

The exponent is a population average, and it gets less reliable the further apart the two distances are — and the more the target distance depends on things the shorter race doesn't test at all.

**Big distance gaps.** Predicting a marathon time from a 5K result stretches the formula well past where it's trustworthy. A 5K is dominated by VO2max and speed; a marathon is dominated by aerobic endurance, fueling, and fatigue resistance over hours, not minutes. Two runners with an identical 5K time can have marathon times that differ by 20+ minutes depending on which of those systems they've actually trained.

**Marathon-specific training the shorter race doesn't measure.** The formula has no way to know whether you've run a 30+ km long run, practiced race-day fueling, or trained your legs to hold pace on tired glycogen stores. A fast 10K runner who hasn't done marathon-specific long runs will typically underperform their Riegel-predicted marathon time — sometimes significantly — because the limiting factor on race day isn't the fitness the 10K measured.

**Different conditions between races.** The formula assumes comparable effort and conditions. If your reference time came from a cool, flat, record-eligible course and your target race is hot, hilly, or crowded, the prediction needs a manual adjustment the formula can't make for you.

**Time gap between the two races.** If you're predicting a race that's months away from your reference result, your fitness on race day may simply be different — better or worse — than it was when you set the time you're predicting from.

## How to calibrate it yourself

Use a reference time as close to the target race distance as you reasonably can — a half marathon predicts a marathon far more reliably than a 5K does. If you only have a shorter reference distance, treat the Riegel output as a ceiling rather than a target, and adjust down for any distance jump larger than roughly double.

For the half-to-marathon jump specifically, many coaches use a steeper exponent (around 1.15–1.20 instead of 1.06) precisely because the standard formula tends to run optimistic at that gap — it's assuming aerobic endurance transfers more cleanly than it usually does for runners without dedicated marathon training.

## Using it in practice

Treat the [Race Time Predictor](/predict/) as a starting estimate, not a target time — especially for a distance jump larger than 2x. Once you've settled on a realistic goal by combining the prediction with your own training-specific judgment, use the [Running Pace Calculator](/pace/) to convert that goal time into an exact per-km or per-mile pace you can actually train and race by.

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
