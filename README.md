# Ryutility

Free, sign-up-free running calculators and training guides at **[ryutility.com](https://ryutility.com/)**, built by Jiman Ryu ([R-Lab](https://ryu.clinic/lab/) / Ryu Clinic Inc.).

- **No accounts, no server database**: All math runs locally in the browser (`assets/js/calc.js`).
- **Transparent formulas**: Every tool states the published equation it uses and where the estimate breaks down.
- **Bilingual**: English (`/`) and Korean (`/ko/`) calculators and core guides.

## Tools Included
- **Training Brief** (`/brief/`) — One recent race result → VDOT zones, predictions, and goal splits in one view
- **Training Zone Calculator** (`/run/`) — Daniels' VDOT pace & Karvonen HR zones with Current vs. Target comparison
- **Running Pace Calculator** (`/pace/`) — Pace, time, distance, and speed solver
- **Race Time Predictor** (`/predict/`) — Side-by-side Riegel (1.06) and VDOT predictions
- **Heart Rate Zone Calculator** (`/hr-zones/`) — Karvonen reserve zones & Tanaka (2001) max HR estimate
- **Splits Calculator** (`/splits/`) — Printable even and negative split tables
- **Treadmill Pace Converter** (`/treadmill/`) — Belt speed to outdoor flat-equivalent pace (ACSM equation)
- **Heat Pace Calculator** (`/heat-pace/`) — Pace adjustment for temperature, humidity, and dew point

## Local Development & Tests

```bash
# Run all JS unit tests (plain Node, no dependencies)
for f in tests/*.test.js; do node "$f"; done

# Serve locally with Jekyll
bundle exec jekyll serve --port 4321
```

## License & Usage Policy

This repository separates **source code**, **editorial content**, and **brand identity**:

- **Source Code (`LICENSE`)**: The source code in this repository is licensed under the **MIT License**.
- **Website Copy & Guides (`CONTENT-LICENSE.md`)**: Guides, calculator explanations, FAQ copy, and educational prose are licensed under **CC BY-NC 4.0** (non-commercial sharing with attribution only; commercial reuse requires prior written permission).
- **Brand, Name & Design (`TRADEMARKS.md`)**: The **Ryutility** name, `ryutility.com` identity, logos, and visual branding are **not** covered by the MIT code license. They may not be reused to create a competing product or website without prior written permission.
- **Attributions (`NOTICE`)**: Lists published exercise-science equations and open-source dependencies.

For code contributions, please see [CONTRIBUTING.md](CONTRIBUTING.md). For security reports, see [SECURITY.md](SECURITY.md).
