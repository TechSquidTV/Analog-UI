# eslint-plugin-analog-design

Local ESLint guardrails for Analog UI's Studio Hyper-Skeuomorphic design system.

The plugin is intentionally repo-local because the rules encode Analog-specific
token policy from `DESIGN.md`, not generic React or Tailwind style guidance.

## Rules

### `analog-design/no-raw-finish-colors`

Flags bespoke finish colors in Analog component code and `packages/analog-ui/src/index.css`.

Examples that should use theme or Analog tokens instead:

- `rgba(...)`
- raw neutral `rgb(0 0 0)` or `rgb(255 255 255)`
- hex color literals
- `color-mix(... black/white ...)`
- direct SVG attrs such as `fill="black"` or `stroke="white"`
- Tailwind utilities such as `text-white`, `border-black/10`, or arbitrary rgba shadows

`theme.css` is not linted by this rule because it is the canonical place where
source token values and derived token recipes are declared.
