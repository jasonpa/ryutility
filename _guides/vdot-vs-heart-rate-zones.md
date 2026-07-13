---
title: "VDOT vs. Heart Rate Zones: Which Should You Train By?"
description: "Pace-based VDOT zones and heart-rate-based Karvonen zones measure different things. Here's when each one is more accurate, with a worked example."
date: 2026-07-12
related_tools:
  - /run/
  - /hr-zones/
---

I've spent the last 14 years running a Korean medicine clinic in Vancouver, and a good chunk of my patients are runners — half of them showing up with an overuse injury that started as "I was just following my training plan." The other half of my working life is spent writing software, which is how a running-pace calculator turned into an actual side project. Ryutility is something I build in my spare time, part of a small collection of tools and experiments I call [**R-Lab**](https://ryu.clinic/lab/), under [Ryu Clinic Inc.](https://ryu.clinic).

Ask five runners how they set their easy-day pace and you'll get two very different answers: some run by pace, some run by heart rate. I hear both camps in clinic, usually mid-argument with themselves about why a run that was "supposed to be easy" left them wrecked. Both are legitimate — they're just measuring different things, and each one breaks down under different conditions. Understanding what each method actually tracks makes it obvious which one to trust on any given day.

## What VDOT pace zones actually measure

The [Training Zone Calculator](/run/) uses Jack Daniels' VDOT method, which scores your current aerobic fitness from a single recent race result and converts that score into target paces for easy running, marathon effort, tempo, threshold, and interval work.

The strength of pace-based zones is precision: "run 5:30/km" is unambiguous and easy to hit on a track or a flat road. There's no lag, no guesswork, no device drift.

The weakness is that pace only means what it means under the conditions it was calibrated for. Heat, humidity, wind, hills, altitude, and accumulated fatigue all change how hard a given pace *feels* — without your underlying fitness changing at all. A 5:30/km pace on a cool, flat morning and the same pace on a humid afternoon are two very different physiological efforts, even though the number on your watch is identical.

## What heart rate zones actually measure

The [Heart Rate Zone Calculator](/hr-zones/) uses the Karvonen method, which sets zones as a percentage of your heart rate reserve (max HR minus resting HR). Instead of targeting a pace, you target an effort level.

The strength here is that heart rate adapts automatically to conditions. If it's hot out, your heart rate will climb to maintain the same effort even as your pace naturally slows — which is exactly the signal you want on an easy day, when the goal is aerobic effort, not a specific split.

The weakness is twofold. First, max heart rate estimates (even age-based ones) can be off by 10–15 bpm for a given individual, which shifts every zone boundary. Second, heart rate lags behind sudden pace changes — it takes 60–90 seconds to catch up to a hard effort — which makes it a poor guide for short, sharp interval work where the pace itself is the point.

## A worked comparison

Say a recent 5K time trial of 25:00 puts you at roughly VDOT 38. The calculator's easy-pace band for that VDOT comes out to about 6:15–6:45/km.

On a cool, flat morning, running 6:30/km at that fitness level typically sits in the middle of an aerobic heart rate zone — exactly the intended effort. But run that same 6:30/km pace on a humid, 28°C afternoon, or on a route with sustained hills, and your heart rate can easily climb 15–20 bpm above where it was on the cool morning. By heart rate, you're no longer running "easy" — you've drifted into tempo effort, even though your watch still shows the same pace you planned.

That gap is the whole argument for tracking both numbers instead of just one — and it's the exact pattern I see in clinic. Someone trains through a hot summer stretch holding their "easy pace" by the watch, heart rate creeping higher every week, and shows up in my office with the kind of overuse strain that comes from weeks of running in a harder zone than they thought they were in.

## When to trust pace

Pace is the better guide when conditions are controlled and the workout depends on hitting a specific number: track intervals, tempo runs on a known flat route, and race-pace practice. In these sessions the point *is* the pace — heart rate is a nice cross-check but shouldn't override the target.

## When to trust heart rate

Heart rate is the better guide whenever effort control matters more than a specific split: hot or humid weather, hilly or trail routes, long runs, recovery days, and running at altitude. On these days, treat your VDOT pace band as a rough starting point and let heart rate set the actual ceiling.

## Using both together

The most reliable approach isn't picking one system — it's using pace as the primary target for controlled, structured sessions, and using heart rate as a guardrail everywhere else. A simple rule that works well in practice: if your heart rate is running 10+ bpm above what you'd expect for a given pace on a normal day, back off the pace regardless of what the zone chart says. Fitness didn't disappear — conditions or fatigue changed, and heart rate is telling you before your legs do.

Calculate your [VDOT training paces](/run/) from a recent race, then set your [heart rate zones](/hr-zones/) alongside them so you have both numbers on hand for every run.

*This guide is part of [R-Lab](https://ryu.clinic/lab/), the side-project arm of Ryu Clinic Inc. — I write these between clinic hours and code commits, from what I've seen work (and not work) in 14 years of treating runners and a lot longer than that of being one.*
