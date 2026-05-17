import * as React from 'react';
import { cn } from '../../lib/utils';

export type AnalogMaterialVariant = 'chrome' | 'black';

const AnalogMaterialContext = React.createContext<AnalogMaterialVariant | null>(null);

export interface AnalogMaterialScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AnalogMaterialVariant;
}

export const AnalogMaterialScope = React.forwardRef<HTMLDivElement, AnalogMaterialScopeProps>(
  ({ className, variant, children, ...props }, ref) => {
    const inheritedVariant = React.useContext(AnalogMaterialContext);
    const resolvedVariant = variant ?? inheritedVariant ?? 'chrome';

    return (
      <AnalogMaterialContext.Provider value={resolvedVariant}>
        <div ref={ref} data-analog-variant={resolvedVariant} className={cn(className)} {...props}>
          {children}
        </div>
      </AnalogMaterialContext.Provider>
    );
  },
);

AnalogMaterialScope.displayName = 'AnalogMaterialScope';

export function useAnalogMaterialVariant(variant?: AnalogMaterialVariant): AnalogMaterialVariant {
  const inheritedVariant = React.useContext(AnalogMaterialContext);
  return variant ?? inheritedVariant ?? 'chrome';
}
