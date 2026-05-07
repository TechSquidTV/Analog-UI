import * as React from 'react';
import { cn } from '../../../lib/utils';
import { useAnalogLighting, type AnalogLightingConfig } from '../../hooks/use-analog-lighting';

export type LCDDisplayVariant = 'lcd-green' | 'lcd-amber' | 'lcd-blue';
export type LCDDisplaySize = 'sm' | 'md' | 'lg';
export type LCDDisplayAlign = 'left' | 'center' | 'right';

export interface LCDDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string | number;
  label?: React.ReactNode;
  units?: React.ReactNode;
  variant?: LCDDisplayVariant;
  size?: LCDDisplaySize;
  digits?: number;
  align?: LCDDisplayAlign;
  lighting?: AnalogLightingConfig<'surface' | 'lens'>;
  screenClassName?: string;
  valueClassName?: string;
}

interface LCDPalette {
  glow: string;
  fill: string;
  ink: string;
  legend: string;
}

const NOISE_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncG type='discrete' tableValues='0 0 0 1 1'/%3E%3CfeFuncB type='discrete' tableValues='0 0 0 1 1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const displayPalettes: Record<LCDDisplayVariant, LCDPalette> = {
  'lcd-green': {
    glow: 'var(--analog-lcd-green-glow)',
    fill: 'var(--analog-lcd-green-fill)',
    ink: 'var(--analog-lcd-green-ink)',
    legend: 'var(--analog-lcd-green-legend)',
  },
  'lcd-amber': {
    glow: 'var(--analog-lcd-amber-glow)',
    fill: 'var(--analog-lcd-amber-fill)',
    ink: 'var(--analog-lcd-amber-ink)',
    legend: 'var(--analog-lcd-amber-legend)',
  },
  'lcd-blue': {
    glow: 'var(--analog-lcd-blue-glow)',
    fill: 'var(--analog-lcd-blue-fill)',
    ink: 'var(--analog-lcd-blue-ink)',
    legend: 'var(--analog-lcd-blue-legend)',
  },
};

const displaySizeStyles = {
  sm: {
    rootClass: 'p-[5px]',
    screenClass: 'px-3 py-2',
    rootRadius: 'calc(var(--radius, 0.75rem) * 1.5)',
    screenRadius: 'calc(var(--radius, 0.75rem) * 1.15)',
    label: 'text-[8px] tracking-[0.34em]',
    units: 'text-[11px] tracking-[0.24em]',
    value: 'text-[24px] tracking-[0.12em]',
    rowGap: 'gap-2',
    valueGap: 'gap-2',
  },
  md: {
    rootClass: 'p-[6px]',
    screenClass: 'px-4 py-3',
    rootRadius: 'calc(var(--radius, 0.75rem) * 1.85)',
    screenRadius: 'calc(var(--radius, 0.75rem) * 1.5)',
    label: 'text-[9px] tracking-[0.34em]',
    units: 'text-[13px] tracking-[0.24em]',
    value: 'text-[32px] tracking-[0.14em]',
    rowGap: 'gap-2.5',
    valueGap: 'gap-3',
  },
  lg: {
    rootClass: 'p-[7px]',
    screenClass: 'px-5 py-4',
    rootRadius: 'calc(var(--radius, 0.75rem) * 2.35)',
    screenRadius: 'calc(var(--radius, 0.75rem) * 1.85)',
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
      variant = 'lcd-green',
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
    const lightingStyle = useAnalogLighting(['surface', 'lens'], lighting);
    const palette = displayPalettes[variant];
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
        style={{
          ...lightingStyle,
          ...style,
        }}
        {...props}
      >
        <div
          className={cn('relative overflow-hidden border', sizeStyle.rootClass)}
          style={{
            borderRadius: sizeStyle.rootRadius,
            borderColor: 'color-mix(in oklch, var(--analog-control-border-strong) 72%, black 28%)',
            background:
              `linear-gradient(calc(var(--analog-light-angle-surface, 180deg) - 90deg), ` +
              `rgba(255,255,255,calc(0.08 * var(--analog-light-power, 1))) 0%, ` +
              `rgba(255,255,255,0.02) 20%, ` +
              `rgba(0,0,0,0.18) 58%, ` +
              `rgba(0,0,0,calc(0.42 * var(--analog-light-power, 1))) 100%), ` +
              `linear-gradient(180deg, var(--analog-surface-raised) 0%, var(--analog-surface-panel) 48%, var(--analog-surface-cavity) 100%)`,
            boxShadow:
              `inset 0 1px 1px rgba(255,255,255,calc(0.14 * var(--analog-light-power, 1))), ` +
              `inset 0 -2px 3px rgba(0,0,0,calc(0.72 * var(--analog-light-power, 1))), ` +
              `0 10px 22px rgba(0,0,0,0.42), ` +
              `0 0 0 1px rgba(0,0,0,0.55)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-[1px] rounded-[inherit]"
            style={{
              border:
                '1px solid color-mix(in oklch, var(--analog-control-foreground) 3.5%, transparent)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -8px 16px rgba(0,0,0,0.18)',
            }}
          />

          <div
            className={cn('relative overflow-visible', sizeStyle.screenClass, screenClassName)}
            style={{ borderRadius: sizeStyle.screenRadius }}
          >
            <div
              className="pointer-events-none absolute inset-[-4px] z-20 rounded-[inherit]"
              style={{
                backgroundColor: palette.glow,
                filter: 'blur(4px)',
                opacity: 0.5,
              }}
            />
            <div
              className="absolute inset-0 z-10 overflow-hidden rounded-[inherit] border analog-surface-recess"
              style={
                {
                  '--analog-light-angle-track': 'var(--analog-light-angle-lens)',
                  borderColor:
                    'color-mix(in oklch, var(--analog-control-border-strong) 76%, black 24%)',
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
                    textShadow: '0 1px 1px rgba(0,0,0,0.35)',
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
                    textShadow: '0 1px 1px rgba(0,0,0,0.35)',
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
                      textShadow: '0 1px 1px rgba(0,0,0,0.35)',
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
