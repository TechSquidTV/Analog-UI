import { RuleTester } from 'eslint';
import analogDesign from './index.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

ruleTester.run('analog-design/no-raw-finish-colors', analogDesign.rules['no-raw-finish-colors'], {
  valid: [
    {
      code: "const style = 'rgb(var(--analog-highlight-rgb) / calc(0.4 * var(--analog-light-power, 1)))';",
      filename: 'packages/analog-ui/src/registry/components/analog/Probe.tsx',
    },
    {
      code: "const style = 'color-mix(in oklch, var(--analog-surface-metal-hi) 78%, var(--analog-highlight-color) 22%)';",
      filename: 'packages/analog-ui/src/registry/components/analog/Probe.tsx',
    },
  ],
  invalid: [
    {
      code: "const style = 'rgba(0, 0, 0, 0.5)';",
      filename: 'packages/analog-ui/src/registry/components/analog/Probe.tsx',
      errors: [{ message: /raw rgba/u }],
    },
    {
      code: "const style = 'color-mix(in oklch, var(--analog-surface-metal-hi) 78%, white 22%)';",
      filename: 'packages/analog-ui/src/registry/components/analog/Probe.tsx',
      errors: [{ message: /black\/white in color-mix/u }],
    },
    {
      code: "const className = 'border-black/10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]';",
      filename: 'packages/analog-ui/src/registry/components/analog/Probe.tsx',
      errors: [{ message: /black\/white Tailwind/u }, { message: /arbitrary shadow/u }],
    },
    {
      code: 'const svg = \'fill="black" stroke="white"\';',
      filename: 'packages/analog-ui/src/registry/components/analog/Probe.tsx',
      errors: [{ message: /SVG color tokens/u }, { message: /SVG color tokens/u }],
    },
  ],
});

ruleTester.run(
  'analog-design/no-unknown-analog-tokens',
  analogDesign.rules['no-unknown-analog-tokens'],
  {
    valid: [
      {
        code: "const style = 'var(--analog-surface-panel)';",
        options: [{ tokens: ['--analog-surface-panel'] }],
      },
      {
        code: "const style = { '--analog-local-depth': '1', boxShadow: 'var(--analog-local-depth)' };",
        options: [{ tokens: [] }],
      },
      {
        code: "const style = 'var(--analog-light-angle-surface) var(--analog-light-power)';",
        options: [{ tokens: [] }],
      },
    ],
    invalid: [
      {
        code: "const style = 'var(--analog-surface-pannel)';",
        options: [{ tokens: ['--analog-surface-panel'] }],
        errors: [{ message: /Define "--analog-surface-pannel"/u }],
      },
    ],
  },
);

ruleTester.run(
  'analog-design/require-lighting-for-finish-channels',
  analogDesign.rules['require-lighting-for-finish-channels'],
  {
    valid: [
      {
        code: "const style = 'rgb(var(--analog-highlight-rgb) / calc(0.4 * var(--analog-light-power, 1)))';",
      },
      {
        code: "const lightingStyle = useAnalogLighting(['surface']); const style = 'rgb(var(--analog-shadow-rgb) / 0.4)';",
      },
      {
        code: "const style = 'linear-gradient(var(--analog-light-angle-surface), rgb(var(--analog-highlight-rgb) / 0.4), transparent)';",
      },
    ],
    invalid: [
      {
        code: "const style = 'rgb(var(--analog-highlight-rgb) / 0.4)';",
        errors: [{ message: /should include useAnalogLighting/u }],
      },
    ],
  },
);
