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
