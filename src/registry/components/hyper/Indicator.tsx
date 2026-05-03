import * as React from 'react';
import { AnalogIndicator as Indicator } from '../analog/Indicator';

export const AnalogIndicator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Indicator>>(
  (props, ref) => <Indicator ref={ref} {...props} />
);
AnalogIndicator.displayName = 'AnalogIndicator';
