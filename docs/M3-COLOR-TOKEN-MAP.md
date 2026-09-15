# Old → New Semantic Token Map

| Old (deprecated) | New semantic | Notes |
|------------------|--------------|-------|
| `--color-apple-blue` | `--pm-primary` | Light #AF0404, Dark #023047 |
| `--color-apple-blue-link` | `--pm-link` | |
| `--color-apple-blue-hover` | `--pm-primary-hover` | |
| `--color-apple-blue-dark` | `--pm-primary-pressed` | |
| `--color-grok-orange` | `--pm-brand-red` (light) / `--pm-brand-cyan` (dark) | Brand only |
| `--color-grok-orange-hover` | `--pm-primary-hover` / `--pm-brand-cyan-light` | |
| `--pm-accent` | brand decorative | Light red, Dark cyan |
| `--pm-bg` | `--pm-background` | |
| `--pm-bg-elevated` | `--pm-surface` | |
| `--pm-fg` | `--pm-text-primary` | |
| `--pm-fg-muted` | `--pm-text-secondary` | |
| `--color-primary-50…950` | `--pm-neutral-*` / surfaces | Bridge only |

## Do not use for body text
- `#FF0000` — brand graphic only
- White on `#023047` for filled button — use `--pm-on-primary` (#002F36)
