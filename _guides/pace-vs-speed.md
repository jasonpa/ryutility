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
