# Sijoituslaskuri — Project Notes

Finnish property investment calculator. Standalone single-file HTML at `public/laskuri/index.html`, deployed to GitHub Pages at https://lamp2022.github.io/home-todo/laskuri/

## What it calculates

- **Annuiteettilaina** (annuity loan) monthly payment, year-by-year interest/principal split
- **IRR** (Internal Rate of Return) via Newton-Raphson, both for the chosen sale year and per-year assuming market-value sale
- **CAGR** (vuosituotto) on own capital
- **Total accumulated oma pääoma** per year = equity (talon hinta − lainasaldo) + cumulative cash flows received
- **Stock market comparison** at 8%/yr compounding on the down payment
- First debt-free year card (dynamic, based on lainaAika)

## Architecture

Single HTML file — no build step, no dependencies except Google Fonts. All state lives in a plain JS object. `compute()` reruns fully on every slider change.

### Key formulas

```js
// Annuity payment
kuukausiera = (velka * kkKorko) / (1 - (1 + kkKorko)^-lainaKk)

// Oma pääoma (total accumulated wealth each year)
kertynyt = taloArvo - lainasaldo + kumKassavirta

// IRR cash flows
irrFlows = [-omaPaaoma, cf_1, cf_2, ..., cf_n + (myyntihinta - lainasaldo_n)]
```

## Deployment

File lives in `public/laskuri/index.html` on `master`. Vite copies it verbatim to `dist/laskuri/index.html`. GitHub Actions builds and deploys on every push to master (~2 min).

Because we work from a feature branch (`claude/create-new-worktree-q8Fx7`), changes must be pushed to **master** separately using `mcp__github__push_files` or `git push origin HEAD:master` after rebasing.

## Errors encountered and fixed

| Bug | Fix |
|---|---|
| CSS `–` (en-dash) in `var(–stone-xxx)` instead of `--` | Replaced all en-dashes with double-hyphen |
| CSS `- { box-sizing... }` invalid selector (markdown artifact) | Changed to `* { ... }` |
| `velka = 0` → NaN kuukausiera | Added `if (velka === 0) kuukausiera = 0` guard |
| `omaPaaoma = 0` → division by zero | Added `omaPaaoma > 0` guards on all return calculations |
| CAGR floor `Math.max(0.01, ...)` masked large losses | Replaced with `multiple <= 0 ? -99.9 : ...` |
| Breakdown identity: lyhennys + arvonmuutos + kassavirta ≠ kokonaisVoitto | Fixed `arvonmuutos = myyntihinta - (omaPaaoma + velka)` |
| "Oma pääoma" showed only equity, not accumulated total | Changed to `taloArvo - lainasaldo + kumKassavirta` |
| Sale year hardcoded to 15 | Defaulted to `lainaAika + 1` (first debt-free year) |
| Background MCP agents pushing stale file versions | Always rebase before local push; don't run background push agents in parallel with local commits |

## Things to avoid

- **Parallel background pushes**: launching `mcp__github__push_files` agents while also committing locally creates race conditions where an older file version overwrites a newer one on master.
- **Pushing from worktree path**: commit signing via `/tmp/code-sign` only works from `/home/user/home-todo`, not from `/home/user/sijoituslaskuri`.
- **Adding columns without header**: table `<th>` count must match `<td>` count per row or the table renders broken.
- **IRR without terminal sale proceeds**: the last cash flow must include `(salePrice - loanBalance)` or IRR will be wildly wrong.
