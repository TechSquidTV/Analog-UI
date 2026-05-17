import * as React from 'react';
import { cn } from '../../../lib/utils';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';
import type { AnalogTone } from './tone';

export type LCDDisplaySize = 'sm' | 'md' | 'lg';
export type LCDDisplayAlign = 'left' | 'center' | 'right';

export interface LCDDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string | number;
  label?: React.ReactNode;
  units?: React.ReactNode;
  tone?: AnalogTone;
  size?: LCDDisplaySize;
  digits?: number;
  align?: LCDDisplayAlign;
  lighting?: AnalogLightingConfig<'surface' | 'track' | 'lens'>;
  screenClassName?: string;
  valueClassName?: string;
}

const NOISE_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0 0 1 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const palette = {
  glow: 'var(--analog-display-glow)',
  fill: 'var(--analog-display-fill)',
  ink: 'var(--analog-display-ink)',
  legend: 'var(--analog-display-legend)',
};

const displaySizeStyles = {
  sm: {
    rootClass: 'p-[5px]',
    screenClass: 'px-3 py-2',
    rootRadius: 'var(--analog-radius-shell)',
    screenRadius: 'var(--analog-radius-window)',
    label: 'text-[8px] tracking-[0.34em]',
    units: 'text-[11px] tracking-[0.24em]',
    value: 'text-[24px] tracking-[0.12em]',
    rowGap: 'gap-2',
    valueGap: 'gap-2',
  },
  md: {
    rootClass: 'p-[6px]',
    screenClass: 'px-4 py-3',
    rootRadius: 'var(--analog-radius-panel)',
    screenRadius: 'var(--analog-radius-recess)',
    label: 'text-[9px] tracking-[0.34em]',
    units: 'text-[13px] tracking-[0.24em]',
    value: 'text-[32px] tracking-[0.14em]',
    rowGap: 'gap-2.5',
    valueGap: 'gap-3',
  },
  lg: {
    rootClass: 'p-[7px]',
    screenClass: 'px-5 py-4',
    rootRadius: 'calc(var(--analog-radius-panel) + 2px)',
    screenRadius: 'var(--analog-radius-shell)',
    label: 'text-[10px] tracking-[0.38em]',
    units: 'text-[15px] tracking-[0.24em]',
    value: 'text-[42px] tracking-[0.16em]',
    rowGap: 'gap-3',
    valueGap: 'gap-3.5',
  },
} as const;

const alignClassNameMap: Record<LCDDisplayAlign, string> = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
};

function formatDisplayValue(
  value: string | number | undefined,
  digits: number | undefined,
  align: LCDDisplayAlign,
) {
  const rawValue =
    value == null
      ? ''
      : typeof value === 'number' && Number.isFinite(value)
        ? `${value}`
        : String(value);

  if (!digits || digits <= rawValue.length) {
    return rawValue;
  }

  if (align === 'left') {
    return rawValue.padEnd(digits, ' ');
  }

  if (align === 'center') {
    const remaining = digits - rawValue.length;
    const leading = Math.floor(remaining / 2);
    return `${' '.repeat(leading)}${rawValue}${' '.repeat(remaining - leading)}`;
  }

  return rawValue.padStart(digits, ' ');
}

export const LCDDisplay = React.forwardRef<HTMLDivElement, LCDDisplayProps>(
  (
    {
      className,
      value = '88.8',
      label,
      units,
      tone = 'success',
      size = 'md',
      digits,
      align = 'right',
      lighting,
      screenClassName,
      valueClassName,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const lightingStyle = useAnalogLighting(['surface', 'track', 'lens'], {
      track: { travel: 1 },
      ...lighting,
    });
    const sizeStyle = displaySizeStyles[size];
    const formattedValue = React.useMemo(
      () => formatDisplayValue(value, digits, align),
      [align, digits, value],
    );
    const displayContent = children ?? formattedValue;

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex max-w-full', className)}
        data-analog-tone={tone}
        style={{
          ...lightingStyle,
          ...style,
        }}
        {...props}
      >
        <div
          className={cn('relative border', sizeStyle.rootClass)}
          style={{
            borderRadius: sizeStyle.rootRadius,
            borderColor:
              'color-mix(in oklch, var(--analog-control-border-strong) 72%, var(--analog-shadow-color) 28%)',
            background:
              `linear-gradient(calc(var(--analog-light-angle-surface, 180deg) - 90deg), ` +
              `rgb(var(--analog-highlight-rgb) / calc(0.08 * var(--analog-light-power, 1))) 0%, ` +
              `var(--analog-display-glass-highlight-subtle) 20%, ` +
              `var(--analog-display-glass-shadow-soft) 58%, ` +
              `rgb(var(--analog-shadow-rgb) / calc(0.42 * var(--analog-light-power, 1))) 100%), ` +
              `linear-gradient(calc(var(--analog-light-angle-surface, 180deg) - 90deg), var(--analog-surface-raised) 0%, var(--analog-surface-panel) 48%, var(--analog-surface-cavity) 100%)`,
            boxShadow:
              `inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) calc(var(--analog-bevel-width, 4px) * 0.25) rgb(var(--analog-highlight-rgb) / calc(0.14 * var(--analog-light-power, 1))), ` +
              `inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.5) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.5) calc(var(--analog-bevel-width, 4px) * 0.75) rgb(var(--analog-shadow-rgb) / calc(0.72 * var(--analog-shadow-depth, 1) * var(--analog-light-power, 1))), ` +
              `calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) 0 rgb(var(--analog-highlight-rgb) / calc(0.08 * var(--analog-light-power, 1))), ` +
              `0 calc(var(--analog-bevel-width, 4px) * 2.5) calc(var(--analog-bevel-width, 4px) * 5.5) rgb(var(--analog-shadow-rgb) / calc(0.42 * var(--analog-shadow-depth, 1))), ` +
              `0 0 0 calc(var(--analog-bevel-width, 4px) * 0.25) rgb(var(--analog-shadow-rgb) / calc(0.55 * var(--analog-shadow-depth, 1)))`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-[1px] rounded-[inherit]"
            style={{
              border:
                '1px solid color-mix(in oklch, var(--analog-control-foreground) 3.5%, transparent)',
              boxShadow:
                'inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 0.25) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -0.25) 0 rgb(var(--analog-highlight-rgb) / 0.03), inset calc(sin(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * -2) calc(cos(var(--analog-light-angle-surface, 180deg)) * var(--analog-bevel-width, 4px) * 2) calc(var(--analog-bevel-width, 4px) * 4) rgb(var(--analog-shadow-rgb) / calc(0.18 * var(--analog-shadow-depth, 1)))',
            }}
          />

          <div
            className={cn('relative overflow-visible', sizeStyle.screenClass, screenClassName)}
            style={{ borderRadius: sizeStyle.screenRadius }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
              style={{
                backgroundColor: palette.glow,
                boxShadow:
                  `0 0 calc(10px * var(--analog-bloom-strength, 0.7) * 1.428571) calc(1px * var(--analog-bloom-strength, 0.7) * 1.428571) ${palette.glow}, ` +
                  `0 0 calc(22px * var(--analog-bloom-strength, 0.7) * 1.428571) calc(3px * var(--analog-bloom-strength, 0.7) * 1.428571) color-mix(in oklch, ${palette.glow} 72%, transparent)`,
                opacity: 'calc(0.42 * var(--analog-bloom-strength, 0.7) * 1.428571)',
              }}
            />
            <div
              className="absolute inset-0 z-10 overflow-hidden rounded-[inherit] border analog-surface-recess"
              style={
                {
                  borderColor:
                    'color-mix(in oklch, var(--analog-control-border-strong) 76%, var(--analog-shadow-color) 24%)',
                } as React.CSSProperties
              }
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundColor: palette.fill,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 mix-blend-screen"
                style={{
                  backgroundImage: NOISE_TEXTURE,
                  opacity: 'var(--analog-grain-opacity)',
                }}
              />
            </div>

            <div className={cn('relative z-30 flex min-w-0 flex-col', sizeStyle.rowGap)}>
              {label ? (
                <div
                  className={cn(
                    'font-lcd font-semibold uppercase leading-none whitespace-pre',
                    sizeStyle.label,
                  )}
                  style={{
                    color: palette.legend,
                    textShadow: '0 1px 1px var(--analog-display-text-shadow)',
                    opacity: 0.9,
                  }}
                >
                  {label}
                </div>
              ) : null}

              <div className={cn('flex min-w-0 items-end', sizeStyle.valueGap)}>
                <div
                  className={cn(
                    'flex min-w-0 flex-1 items-center whitespace-pre font-lcd font-bold uppercase leading-none',
                    sizeStyle.value,
                    alignClassNameMap[align],
                    valueClassName,
                  )}
                  style={{
                    color: palette.ink,
                    textShadow: '0 1px 1px var(--analog-display-text-shadow)',
                    opacity: 0.9,
                  }}
                >
                  {displayContent}
                </div>

                {units ? (
                  <div
                    className={cn(
                      'shrink-0 whitespace-pre font-lcd font-semibold uppercase leading-none',
                      sizeStyle.units,
                    )}
                    style={{
                      color: palette.legend,
                      textShadow: '0 1px 1px var(--analog-display-text-shadow)',
                      opacity: 0.9,
                    }}
                  >
                    {units}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

LCDDisplay.displayName = 'LCDDisplay';
