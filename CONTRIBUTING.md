# Contributing to Ryutility

Thank you for your interest in improving Ryutility!

## Scope
- Bug fixes, math accuracy improvements, accessibility fixes, and unit tests in `assets/js/calc.js`, `assets/js/site.js`, and `tests/` are welcome.
- Before proposing large feature additions, please keep Ryutility's core principles in mind: no user accounts, no server-side storage, fast mobile UX, and transparent formulas.

## How to Contribute
1. Fork the repository and create a feature branch.
2. Run all unit tests and verify zero failures:
   ```bash
   for f in tests/*.test.js; do node "$f"; done
   ```
3. Open a pull request describing what changed and why.

## License Agreement
By submitting a pull request to this repository, you agree that your code contributions will be licensed under the MIT License (`LICENSE`).
