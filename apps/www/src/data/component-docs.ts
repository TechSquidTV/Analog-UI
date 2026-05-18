import type { ComponentName } from './component-catalog';

export interface ComponentApiProp {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface ComponentApiSection {
  title: string;
  description: string;
  props: ComponentApiProp[];
}

interface ComponentCompositionDoc {
  description: string;
  tree: string;
  customizeTitle?: string;
  customizeDescription?: string;
  customizeCode?: string;
}

interface ComponentPageDoc {
  usageIntro: string;
  registryImportCode: string;
  packageImportCode?: string;
  usageCode: string;
  exampleCode: string;
  composition?: ComponentCompositionDoc;
  /** Editorial descriptions for generated API docs; source prop names, types, and defaults come from component-api-loader. */
  api: ComponentApiSection[];
}

function registryImport(names: string[], file: string) {
  return `import { ${names.join(', ')} } from "@/registry/components/analog/${file}"`;
}

function packageImport(names: string[]) {
  return `import "analog-ui/styles.css";
import { ${names.join(', ')} } from "analog-ui"`;
}

const lightingProp = {
  name: 'lighting',
  type: 'AnalogLightingConfig<...>',
  description:
    'Overrides resolved light channels for the component materials. Set interactive: false to opt out of interactive pointer lighting.',
};

const classNameProp = {
  name: 'className',
  type: 'string',
  description: 'Adds classes to the outer component shell.',
};

const styleProp = {
  name: 'style',
  type: 'React.CSSProperties',
  description: 'Adds inline styles to the outer component shell.',
};

const controlClassNameProp = {
  name: 'controlClassName',
  type: 'string',
  description: 'Adds classes to the inner interactive control root.',
};

const controlStyleProp = {
  name: 'controlStyle',
  type: 'React.CSSProperties',
  description: 'Adds inline styles to the inner interactive control root.',
};

export const componentDocs: Record<ComponentName, ComponentPageDoc> = {
  dial: {
    usageIntro:
      'Use Dial for encoder-style rotation by default, or pass min and max to make it behave like a bounded knob.',
    registryImportCode: registryImport(['Dial'], 'Dial'),
    packageImportCode: packageImport(['Dial']),
    usageCode: `<Dial defaultValue={42} />`,
    exampleCode: `"use client"

import * as React from "react"
import { Dial } from "@/registry/components/analog/Dial"

export function DialExample() {
  const [value, setValue] = React.useState(42)

  return (
    <Dial
      mode="knob"
      min={0}
      max={100}
      value={value}
      onValueChange={setValue}
    />
  )
}`,
    composition: {
      description:
        'Dial owns the spinbutton, pointer, keyboard, and wheel behavior while exposing the tactile surface and pointer mark as replaceable visual layers.',
      tree: `Dial
|- Root / spinbutton behavior
+- Surface (\`renderSurface\`)
   |- SurfaceButton
   +- Pointer Mark (\`renderPointer\`)`,
      customizeTitle: 'Custom Pointer',
      customizeDescription:
        'Use renderPointer when the cap should stay intact but the pointer mark needs a different readout style.',
      customizeCode: `import { Dial } from "@/registry/components/analog/Dial"

export function CustomPointerDial() {
  return (
    <Dial
      mode="knob"
      defaultValue={42}
      min={0}
      max={100}
      renderPointer={({ rotation }) => (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ transform: \`rotate(\${rotation}deg)\` }}
        >
          <div className="absolute left-1/2 top-[10%] h-[34%] w-[5%] -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(125,211,252,0.9)]" />
        </div>
      )}
    />
  )
}`,
    },
    api: [
      {
        title: 'Dial',
        description: 'A rotary control that supports free encoder travel and bounded knob travel.',
        props: [
          {
            name: 'value',
            type: 'number',
            description: 'Controlled value in degrees or domain units.',
          },
          { name: 'defaultValue', type: 'number', description: 'Initial uncontrolled value.' },
          {
            name: 'onChange',
            type: '(value: number, degrees: number, revolutions: number) => void',
            description: 'Receives the value, wrapped degrees, and revolution count.',
          },
          {
            name: 'onValueChange',
            type: '(value: number) => void',
            description: 'Receives only the next value.',
          },
          {
            name: 'mode',
            type: '"encoder" | "knob"',
            defaultValue: 'auto',
            description: 'Encoder mode is endless; knob mode clamps between min and max.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the material finish.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Disables pointer, wheel, and keyboard interaction.',
          },
          {
            name: 'min / max',
            type: 'number',
            defaultValue: '0 / 100',
            description: 'Domain bounds for knob mode.',
          },
          {
            name: 'step',
            type: 'number',
            defaultValue: '1 or 15',
            description: 'Keyboard and wheel increment.',
          },
          {
            name: 'fineStep / coarseStep',
            type: 'number',
            description: 'Alt and shift keyboard or wheel increments.',
          },
          {
            name: 'startAngle',
            type: 'number',
            defaultValue: '210',
            description: 'Starting pointer angle for knob mode.',
          },
          {
            name: 'sweepAngle',
            type: 'number',
            defaultValue: '300',
            description: 'Degrees of travel for knob mode.',
          },
          {
            name: 'detentValue / detentThreshold',
            type: 'number',
            description: 'Optional snap point and threshold for knob mode.',
          },
          {
            name: 'surfaceClassName / pointerClassName',
            type: 'string',
            description: 'Adds classes to the default cap surface or pointer mark.',
          },
          {
            name: 'renderSurface',
            type: '(props: DialRenderSurfaceProps) => React.ReactNode',
            description:
              'Replaces the tactile cap surface while keeping Dial behavior on the root.',
          },
          {
            name: 'renderPointer',
            type: '(props: DialRenderPointerProps) => React.ReactNode',
            description: 'Replaces the rotating pointer mark inside the cap.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'DialRenderSurface',
        description: 'Props passed to renderSurface for the tactile cap layer.',
        props: [
          {
            name: 'value / ratio',
            type: 'number',
            description: 'Resolved value and normalized position.',
          },
          {
            name: 'min / max',
            type: 'number',
            description: 'Resolved knob domain bounds.',
          },
          {
            name: 'mode / isKnob',
            type: '"encoder" | "knob" / boolean',
            description: 'Resolved travel mode.',
          },
          {
            name: 'degrees / revolutions / rotation',
            type: 'number',
            description: 'Wrapped angle, encoder revolution count, and active rotation.',
          },
          {
            name: 'variant / disabled / isDragging',
            type: '"chrome" | "black" / boolean',
            description: 'Resolved material and interaction state.',
          },
          {
            name: 'containerClassName / className / style',
            type: 'string / React.CSSProperties',
            description: 'Default SurfaceButton layout and surface props.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Default pointer mark to place inside a custom surface.',
          },
        ],
      },
      {
        title: 'DialRenderPointer',
        description: 'Props passed to renderPointer for the rotating pointer mark.',
        props: [
          {
            name: 'value / ratio',
            type: 'number',
            description: 'Resolved value and normalized position.',
          },
          {
            name: 'min / max',
            type: 'number',
            description: 'Resolved knob domain bounds.',
          },
          {
            name: 'mode / isKnob',
            type: '"encoder" | "knob" / boolean',
            description: 'Resolved travel mode.',
          },
          {
            name: 'degrees / revolutions / rotation',
            type: 'number',
            description: 'Wrapped angle, encoder revolution count, and active rotation.',
          },
          {
            name: 'variant / disabled / isDragging',
            type: '"chrome" | "black" / boolean',
            description: 'Resolved material and interaction state.',
          },
          {
            name: 'pointerBevelAngle',
            type: 'string',
            description: 'Light-relative angle used by the default bevel shading.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default pointer mark classes and styles.',
          },
          {
            name: 'highlightClassName / highlightStyle',
            type: 'string / React.CSSProperties',
            description: 'Default pointer highlight props.',
          },
        ],
      },
      {
        title: 'SurfaceButton',
        description:
          'Reusable cap surface used by Dial, Gauge, RotarySwitch, and Panel hardware layers.',
        props: [
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Content rendered above the foil, glare, and texture layers.',
          },
          {
            name: 'containerClassName',
            type: 'string',
            description: 'Adds classes to the wrapper around the lit surface root.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Sets aria-disabled on the surface root.',
          },
          {
            name: 'rotation',
            type: 'number',
            defaultValue: '0',
            description: 'Rotates the foil and texture treatment in degrees.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the material finish.',
          },
          lightingProp,
          classNameProp,
          styleProp,
        ],
      },
    ],
  },
  slider: {
    usageIntro: 'Use Slider for horizontal or vertical fader travel with optional scale marks.',
    registryImportCode: registryImport(['Slider'], 'Slider'),
    packageImportCode: packageImport(['Slider']),
    usageCode: `<Slider defaultValue={0} min={-40} max={10} className="w-full max-w-md" />`,
    exampleCode: `"use client"

import * as React from "react"
import { Slider } from "@/registry/components/analog/Slider"

export function SliderExample() {
  const [value, setValue] = React.useState(0)

  return (
    <Slider
      value={value}
      onValueChange={(next) => setValue(next as number)}
      min={-40}
      max={10}
      marks={[
        { value: -40, label: "-40" },
        { value: 0, label: "0" },
        { value: 10, label: "+10" },
      ]}
      className="w-full max-w-md"
    />
  )
}`,
    composition: {
      description:
        'Slider keeps Base UI behavior intact while exposing the physical scale, track, and thumb as stable parts.',
      tree: `Slider
|- Root / Base UI slider behavior
|- Scale Marks
|- Track Recess
|  |- Track Slot
|  +- Guide Line
+- Thumb
   +- RockerThumbSurface`,
      customizeTitle: 'Custom Thumb',
      customizeDescription:
        'Use renderThumb when the fader handle needs a different surface without rebuilding slider behavior.',
      customizeCode: `import { Slider } from "@/registry/components/analog/Slider"
import { RockerThumbSurface } from "@/registry/components/analog/RockerThumbSurface"

export function CustomSliderThumb() {
  return (
    <Slider
      defaultValue={0}
      min={-40}
      max={10}
      className="w-full max-w-md"
      renderThumb={({ className, orientation, variant, children }) => (
        <RockerThumbSurface
          className={className}
          variant={variant}
          orientation={orientation}
          raisedSide="both"
          extrusionLayers={10}
        >
          <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--analog-control-foreground-subtle)]" />
          {children}
        </RockerThumbSurface>
      )}
    />
  )
}`,
    },
    api: [
      {
        title: 'Slider',
        description:
          'A Base UI slider root with Analog UI track, thumb, marks, and lighting treatment.',
        props: [
          { name: 'value', type: 'number | number[]', description: 'Controlled slider value.' },
          {
            name: 'defaultValue',
            type: 'number | number[]',
            description: 'Initial uncontrolled value.',
          },
          {
            name: 'onValueChange',
            type: '(value: number | number[]) => void',
            description: 'Receives updates from drag, keyboard, and pointer input.',
          },
          {
            name: 'min / max',
            type: 'number',
            defaultValue: '0 / 100',
            description: 'Value range.',
          },
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Changes the slider travel axis.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the thumb material finish.',
          },
          {
            name: 'marks',
            type: 'SliderMark[]',
            description: 'Optional scale marks with value, label, position, and alignment.',
          },
          {
            name: 'showMarks',
            type: 'boolean',
            defaultValue: 'marks !== undefined',
            description: 'Controls whether marks are rendered.',
          },
          {
            name: 'trackClassName',
            type: 'string',
            description: 'Adds classes to the visual track recess rendered inside the slider.',
          },
          {
            name: 'thumbClassName',
            type: 'string',
            description:
              'Adds classes to the Base UI thumb wrapper for size or positioning tweaks.',
          },
          {
            name: 'markClassName',
            type: 'string',
            description: 'Adds classes to each default scale mark.',
          },
          {
            name: 'renderTrack',
            type: '(props: SliderRenderTrackProps) => React.ReactNode',
            description: 'Replaces the visual track while preserving slider behavior.',
          },
          {
            name: 'renderThumb',
            type: '(props: SliderRenderThumbProps) => React.ReactNode',
            description: 'Replaces the visual thumb surface inside the Base UI thumb wrapper.',
          },
          {
            name: 'renderMark',
            type: '(props: SliderRenderMarkProps) => React.ReactNode',
            description: 'Replaces individual scale mark labels.',
          },
          {
            name: 'getAriaLabel',
            type: '(index: number) => string',
            description: 'Names the nested range input for assistive technology.',
          },
          {
            name: 'getAriaValueText',
            type: '(formattedValue: string, value: number, index: number) => string',
            description: 'Provides a human-readable value for the nested range input.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'SliderRenderTrack',
        description: 'Props passed to renderTrack for the non-interactive visual track layer.',
        props: [
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            description: 'Current slider travel axis.',
          },
          {
            name: 'isVertical',
            type: 'boolean',
            description: 'Convenience boolean for orientation-specific layout.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Default classes for the visual track recess.',
          },
        ],
      },
      {
        title: 'SliderRenderThumb',
        description: 'Props passed to renderThumb for the visual thumb surface.',
        props: [
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            description: 'Current slider travel axis.',
          },
          {
            name: 'isVertical',
            type: 'boolean',
            description: 'Convenience boolean for orientation-specific layout.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            description: 'Resolved material variant inherited by the slider.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Default classes for the thumb surface shell.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Default thumb overlay content such as the focus ring.',
          },
        ],
      },
      {
        title: 'RockerThumbSurface',
        description:
          'Reusable tactile thumb shell used by Slider, Toggle, and custom rocker-style controls.',
        props: [
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the material finish.',
          },
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Controls the bevel, ridge, and raised-side axis.',
          },
          {
            name: 'raisedSide',
            type: '"start" | "end" | "both"',
            defaultValue: '"start"',
            description: 'Chooses which side of the rocker appears raised.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '24',
            description: 'Controls the rendered thumb depth layers.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Optional content layered inside the thumb surface.',
          },
          classNameProp,
          styleProp,
        ],
      },
      {
        title: 'SliderRenderMark',
        description: 'Props passed to renderMark for each scale mark label.',
        props: [
          {
            name: 'mark',
            type: 'SliderResolvedMark',
            description: 'Resolved mark data including ratio and alignment.',
          },
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            description: 'Current slider travel axis.',
          },
          {
            name: 'isVertical',
            type: 'boolean',
            description: 'Convenience boolean for orientation-specific layout.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Default classes for the scale mark.',
          },
          {
            name: 'style',
            type: 'React.CSSProperties',
            description: 'Default absolute positioning style for the mark.',
          },
        ],
      },
    ],
  },
  toggle: {
    usageIntro: 'Use Toggle when a two-position choice should read like a heavy rocker.',
    registryImportCode: registryImport(['Toggle'], 'Toggle'),
    packageImportCode: packageImport(['Toggle']),
    usageCode: `<Toggle value="right" leftIndicatorTone="warning" rightIndicatorTone="success" />`,
    exampleCode: `"use client"

import * as React from "react"
import { Toggle } from "@/registry/components/analog/Toggle"

export function ToggleExample() {
  const [value, setValue] = React.useState<"left" | "right">("right")

  return (
    <Toggle
      value={value}
      onValueChange={setValue}
      leftIndicatorTone="warning"
      rightIndicatorTone="success"
    />
  )
}`,
    api: [
      {
        title: 'Toggle',
        description: 'A Base UI toggle group styled as a two-position rocker switch.',
        props: [
          {
            name: 'value',
            type: '"left" | "right"',
            defaultValue: '"left"',
            description: 'Controlled selected side.',
          },
          {
            name: 'defaultValue',
            type: '"left" | "right"',
            defaultValue: '"left"',
            description: 'Initial uncontrolled selected side.',
          },
          {
            name: 'onValueChange',
            type: '(value: "left" | "right") => void',
            description: 'Receives the next selected side.',
          },
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Changes rocker direction.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the rocker material finish.',
          },
          {
            name: 'leftIndicatorTone / rightIndicatorTone',
            type: 'AnalogTone',
            defaultValue: 'undefined',
            description: 'Adds optional tone-driven indicators on either side.',
          },
          {
            name: 'leftIndicatorActive / rightIndicatorActive',
            type: '"auto" | "always" | "never"',
            defaultValue: '"auto"',
            description: 'Controls when each indicator is lit.',
          },
          {
            name: 'leftAriaLabel / rightAriaLabel',
            type: 'string',
            defaultValue: '"Left toggle option" / "Right toggle option"',
            description: 'Names the invisible left and right toggle hit targets.',
          },
          lightingProp,
          classNameProp,
          styleProp,
        ],
      },
    ],
  },
  'rocker-switch-group': {
    usageIntro:
      'Use RockerSwitchGroup to arrange multiple heavy rocker toggles in a shared recessed bank.',
    registryImportCode: registryImport(
      ['RockerSwitchGroup', 'RockerSwitchGroupItem'],
      'RockerSwitchGroup',
    ),
    packageImportCode: packageImport(['RockerSwitchGroup', 'RockerSwitchGroupItem']),
    usageCode: `<RockerSwitchGroup>
  <RockerSwitchGroupItem label="Main" value={main} onValueChange={setMain} />
  <RockerSwitchGroupItem label="Aux" value={aux} onValueChange={setAux} />
</RockerSwitchGroup>`,
    exampleCode: `"use client"

import * as React from "react"
import {
  RockerSwitchGroup,
  RockerSwitchGroupItem,
} from "@/registry/components/analog/RockerSwitchGroup"

export function RockerSwitchGroupExample() {
  const [main, setMain] = React.useState<"left" | "right">("right")
  const [aux, setAux] = React.useState<"left" | "right">("left")

  return (
    <RockerSwitchGroup aria-label="Bus controls">
      <RockerSwitchGroupItem label="Main" value={main} onValueChange={setMain} />
      <RockerSwitchGroupItem
        label="Aux"
        value={aux}
        onValueChange={setAux}
        variant="black"
        leftIndicatorTone="destructive"
      />
    </RockerSwitchGroup>
  )
}`,
    api: [
      {
        title: 'RockerSwitchGroup',
        description: 'A recessed layout bank for related rocker toggles.',
        props: [
          {
            name: 'layout',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Controls how switch items flow through the bank.',
          },
          {
            name: 'switchOrientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Default rocker direction for items in the bank.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Default material finish for child rockers.',
          },
          {
            name: 'leftIndicatorTone / rightIndicatorTone',
            type: 'AnalogTone',
            defaultValue: '"warning" / "success"',
            description: 'Default indicator tones for child rockers.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'RockerSwitchGroupItem',
        description: 'A labeled rocker switch inside a RockerSwitchGroup bank.',
        props: [
          {
            name: 'label',
            type: 'React.ReactNode',
            description:
              'Short hardware label rendered beside the rocker. String and number labels also seed default accessible labels for the nested toggle targets.',
          },
          {
            name: 'labelPosition',
            type: '"start" | "end" | "top" | "bottom"',
            defaultValue: '"top"',
            description: 'Places the item label around the rocker.',
          },
          {
            name: 'toggleClassName',
            type: 'string',
            description: 'Adds classes to the nested Toggle control.',
          },
          {
            name: 'value / onValueChange',
            type: 'Toggle value props',
            description: 'Passes through controlled value handling to the nested Toggle.',
          },
          {
            name: 'defaultValue / indicator / aria props',
            type: 'ToggleProps',
            description:
              'Passes through defaultValue, indicator tone or active props, aria labels, lighting, and other Toggle props.',
          },
          classNameProp,
        ],
      },
    ],
  },
  'push-button': {
    usageIntro: 'Use PushButton for a momentary action with physical plunger travel.',
    registryImportCode: registryImport(['PushButton'], 'PushButton'),
    packageImportCode: packageImport(['PushButton']),
    usageCode: `<PushButton onClick={() => console.log("Run")}>RUN</PushButton>`,
    exampleCode: `import { PushButton } from "@/registry/components/analog/PushButton"

export function PushButtonExample() {
  return (
    <PushButton onClick={() => console.log("Run")}>
      RUN
    </PushButton>
  )
}`,
    composition: {
      description:
        'PushButton keeps Base UI button behavior on a transparent interactive root while the recessed shell and SquarePlunger carry the physical styling.',
      tree: `PushButton
|- Shell / Track Recess
|- Root / Base UI button behavior
|  +- Plunger Wrapper
|     +- SquarePlunger
|        |- Extrusion Layers
|        +- Face / Content`,
      customizeTitle: 'Shell Styling',
      customizeDescription:
        'Use className and style for the recessed shell. Use controlClassName and controlStyle only when the transparent interactive root needs adjustment.',
      customizeCode: `import { PushButton } from "@/registry/components/analog/PushButton"

export function StyledPushButton() {
  return (
    <PushButton
      className="[--analog-bevel-width:5px]"
      controlClassName="focus-visible:outline-2"
    >
      RUN
    </PushButton>
  )
}`,
    },
    api: [
      {
        title: 'PushButton',
        description: 'A Base UI button wrapped in a 3D plunger surface.',
        props: [
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the plunger material finish.',
          },
          {
            name: 'width',
            type: 'React.CSSProperties["width"]',
            defaultValue: 'content width',
            description:
              'Sets the plunger footprint width. Omit it to size from the label with built-in padding.',
          },
          {
            name: 'height',
            type: 'React.CSSProperties["height"]',
            defaultValue: '"3.5rem"',
            description: 'Sets the plunger footprint height.',
          },
          {
            name: 'href / target / rel / download',
            type: 'string / HTMLAttributeAnchorTarget / string / AnchorHTMLAttributes["download"]',
            description: 'Renders the button as a link and forwards anchor metadata.',
          },
          {
            name: 'onPointerDown / onPointerUp / onPointerCancel / onPointerLeave',
            type: 'React.PointerEventHandler<HTMLButtonElement | HTMLAnchorElement>',
            description:
              'Pointer event handlers forwarded to the interactive root while preserving pressed-depth feedback.',
          },
          {
            name: 'onKeyDown / onKeyUp / onBlur',
            type: 'React keyboard/focus handlers',
            description:
              'Keyboard and blur handlers forwarded to the interactive root while preserving pressed-depth feedback.',
          },
          {
            name: 'onMouseDown / onMouseUp / onMouseLeave',
            type: 'React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>',
            description: 'Mouse event handlers forwarded to the interactive root.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '32',
            description: 'Controls the number of rendered depth layers.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Label or icon rendered on the plunger face.',
          },
          lightingProp,
          classNameProp,
          styleProp,
          controlClassNameProp,
          controlStyleProp,
        ],
      },
      {
        title: 'SquarePlunger',
        description:
          'Reusable 3D plunger surface used by push buttons, push toggles, checkboxes, and toggle-button groups.',
        props: [
          {
            name: 'isPressed',
            type: 'boolean',
            description: 'Controls the plunger travel depth and tilt state.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black" | "rubber"',
            defaultValue: 'inherited',
            description: 'Sets the plunger face and extrusion material.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '32',
            description: 'Controls the rendered depth layers.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Face content rendered above the material treatment.',
          },
          {
            name: 'indicator',
            type: 'React.ReactNode',
            description: 'Optional status indicator rendered on the plunger face.',
          },
          classNameProp,
          styleProp,
          {
            name: 'faceClassName',
            type: 'string',
            description: 'Adds classes to the top face layer.',
          },
          {
            name: 'faceStyle',
            type: 'React.CSSProperties',
            description: 'Overrides or extends the top face background and shadow.',
          },
        ],
      },
    ],
  },
  'push-toggle': {
    usageIntro: 'Use PushToggle for a latching push control with optional tone state feedback.',
    registryImportCode: registryImport(['PushToggle'], 'PushToggle'),
    packageImportCode: packageImport(['PushToggle']),
    usageCode: `<PushToggle defaultPressed indicatorTone="success">ARM</PushToggle>`,
    exampleCode: `"use client"

import * as React from "react"
import { PushToggle } from "@/registry/components/analog/PushToggle"

export function PushToggleExample() {
  const [pressed, setPressed] = React.useState(true)

  return (
    <PushToggle
      pressed={pressed}
      onPressedChange={setPressed}
      indicatorTone="success"
    >
      ARM
    </PushToggle>
  )
}`,
    composition: {
      description:
        'PushToggle keeps Base UI toggle behavior on a transparent interactive root while its latched state drives SquarePlunger depth and optional indicator feedback.',
      tree: `PushToggle
|- Shell / Track Recess
|- Root / Base UI toggle behavior
|  +- Plunger Wrapper
|     +- SquarePlunger
|        |- Extrusion Layers
|        |- Indicator
|        +- Face / Content`,
      customizeTitle: 'Control Styling',
      customizeDescription:
        'Use className and style for the recessed shell. Use controlClassName and controlStyle only when the transparent interactive root needs adjustment.',
      customizeCode: `import { PushToggle } from "@/registry/components/analog/PushToggle"

export function StyledPushToggle() {
  return (
    <PushToggle
      defaultPressed
      indicatorTone="success"
      className="[--analog-bevel-width:5px]"
      controlClassName="focus-visible:outline-2"
    >
      ARM
    </PushToggle>
  )
}`,
    },
    api: [
      {
        title: 'PushToggle',
        description: 'A Base UI toggle wrapped in a 3D plunger surface.',
        props: [
          { name: 'pressed', type: 'boolean', description: 'Controlled pressed state.' },
          {
            name: 'defaultPressed',
            type: 'boolean',
            description: 'Initial uncontrolled pressed state.',
          },
          {
            name: 'onPressedChange',
            type: '(pressed: boolean) => void',
            description: 'Receives pressed state changes.',
          },
          {
            name: 'indicatorTone',
            type: 'AnalogTone',
            defaultValue: 'undefined',
            description: 'Optional indicator tone on the plunger face.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the plunger material finish.',
          },
          {
            name: 'width',
            type: 'React.CSSProperties["width"]',
            defaultValue: 'content width',
            description:
              'Sets the plunger footprint width. Omit it to size from the label with built-in padding.',
          },
          {
            name: 'height',
            type: 'React.CSSProperties["height"]',
            defaultValue: '"3.5rem"',
            description: 'Sets the plunger footprint height.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '32',
            description: 'Controls the rendered depth layers.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Plunger face content.',
          },
          lightingProp,
          classNameProp,
          styleProp,
          controlClassNameProp,
          controlStyleProp,
        ],
      },
    ],
  },
  checkbox: {
    usageIntro:
      'Use Checkbox for form-native checked, unchecked, and mixed states when an option is included in a set.',
    registryImportCode: registryImport(['Checkbox', 'CheckboxGroup'], 'Checkbox'),
    packageImportCode: packageImport(['Checkbox', 'CheckboxGroup']),
    usageCode: `<Checkbox name="routing" value="sidechain" defaultChecked>
  Sidechain
</Checkbox>`,
    exampleCode: `"use client"

import * as React from "react"
import { Checkbox, CheckboxGroup } from "@/registry/components/analog/Checkbox"

const options = ["monitor", "sidechain", "print"]

export function CheckboxExample() {
  const [value, setValue] = React.useState(["monitor", "sidechain"])

  return (
    <CheckboxGroup
      aria-label="Routing options"
      value={value}
      onValueChange={setValue}
      allValues={options}
      tone="success"
    >
      <Checkbox parent>Route All</Checkbox>
      <Checkbox name="routing" value="monitor">
        Monitor
      </Checkbox>
      <Checkbox name="routing" value="sidechain">
        Sidechain
      </Checkbox>
      <Checkbox name="routing" value="print">
        Print
      </Checkbox>
    </CheckboxGroup>
  )
}`,
    composition: {
      description:
        'Checkbox keeps Base UI checkbox and checkbox-group behavior while rendering each option as a flat rubber plunger whose face color and glow represent state.',
      tree: `Checkbox
|- Label Wrapper
|- Control Shell / Surface Recess
|  +- Root / Base UI checkbox behavior
|     +- SquarePlunger
|        +- Lit Face / Emissive Glow
+- Label Text

CheckboxGroup
|- Root / Base UI checkbox group behavior
+- Checkbox items`,
      customizeTitle: 'Form Semantics',
      customizeDescription:
        'Use Checkbox when the state should submit with a form or belong to a multi-select set. Use PushToggle for command buttons, mode latches, and controls that should announce as pressed.',
      customizeCode: `import { Checkbox, CheckboxGroup } from "@/registry/components/analog/Checkbox"

export function RoutingChecklist() {
  return (
    <CheckboxGroup aria-label="Routing options" defaultValue={["monitor"]}>
      <Checkbox name="routing" value="monitor" tone="success">
        Monitor
      </Checkbox>
      <Checkbox name="routing" value="sidechain" tone="warning">
        Sidechain
      </Checkbox>
      <Checkbox name="routing" value="print" tone="info">
        Print
      </Checkbox>
    </CheckboxGroup>
  )
}`,
    },
    api: [
      {
        title: 'Checkbox',
        description:
          'A Base UI checkbox root styled as a square rubber plunger with label and form support.',
        props: [
          { name: 'checked', type: 'boolean', description: 'Controlled checked state.' },
          {
            name: 'defaultChecked',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Initial uncontrolled checked state.',
          },
          {
            name: 'onCheckedChange',
            type: '(checked: boolean) => void',
            description: 'Receives checked state changes.',
          },
          {
            name: 'indeterminate',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Renders a mixed state for parent or partial selections.',
          },
          {
            name: 'name / value',
            type: 'string',
            description: 'Form field name and submitted value for checked options.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Visible checkbox label content.',
          },
          {
            name: 'parent',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Marks this checkbox as the parent controller inside a CheckboxGroup.',
          },
          {
            name: 'variant',
            type: '"rubber" | "chrome" | "black"',
            defaultValue: '"rubber"',
            description:
              'Sets the plunger material finish. Checkbox defaults to flat white rubber.',
          },
          {
            name: 'tone',
            type: 'AnalogTone',
            defaultValue: '"accent"',
            description: 'Sets the optical tone used by the checked or mixed state.',
          },
          {
            name: 'size',
            type: 'React.CSSProperties["width"]',
            defaultValue: '"2.75rem"',
            description: 'Sets the square control footprint.',
          },
          {
            name: 'labelPosition',
            type: '"start" | "end" | "top" | "bottom"',
            defaultValue: '"end"',
            description: 'Places the text label around the square control.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '18',
            description: 'Controls rendered plunger depth.',
          },
          lightingProp,
          classNameProp,
          styleProp,
          {
            name: 'controlClassName',
            type: 'string',
            description: 'Adds classes to the square visual control shell.',
          },
          {
            name: 'controlStyle',
            type: 'React.CSSProperties',
            description: 'Adds inline styles to the square visual control shell.',
          },
          {
            name: 'labelClassName',
            type: 'string',
            description: 'Adds classes to the visible checkbox label.',
          },
        ],
      },
      {
        title: 'CheckboxGroup',
        description:
          'A Base UI checkbox group with a recessed shell and shared visual defaults for child checkboxes.',
        props: [
          {
            name: 'value',
            type: 'string[]',
            description: 'Controlled selected checkbox values.',
          },
          {
            name: 'defaultValue',
            type: 'string[]',
            description: 'Initial uncontrolled selected values.',
          },
          {
            name: 'onValueChange',
            type: '(value: string[]) => void',
            description: 'Receives the selected values when any child checkbox changes.',
          },
          {
            name: 'allValues',
            type: 'string[]',
            description: 'All child values, used by Base UI for parent checkbox mixed states.',
          },
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"vertical"',
            description: 'Controls the group layout.',
          },
          {
            name: 'variant',
            type: '"rubber" | "chrome" | "black"',
            defaultValue: '"rubber"',
            description: 'Default plunger material finish for child checkboxes.',
          },
          {
            name: 'tone',
            type: 'AnalogTone',
            defaultValue: '"accent"',
            description: 'Default optical tone for child checkboxes.',
          },
          {
            name: 'itemSize',
            type: 'React.CSSProperties["width"]',
            defaultValue: '"2.75rem"',
            description: 'Default square footprint for child checkboxes.',
          },
          {
            name: 'itemLabelPosition',
            type: '"start" | "end" | "top" | "bottom"',
            defaultValue: '"end"',
            description: 'Default label placement for child checkboxes.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '18',
            description: 'Default rendered plunger depth for child checkboxes.',
          },
          lightingProp,
          classNameProp,
          styleProp,
        ],
      },
    ],
  },
  'toggle-button-group': {
    usageIntro:
      'Use ToggleButtonGroup for mutually exclusive push toggles with tone state feedback.',
    registryImportCode: registryImport(
      ['ToggleButtonGroup', 'ToggleButtonGroupItem'],
      'ToggleButtonGroup',
    ),
    packageImportCode: packageImport(['ToggleButtonGroup', 'ToggleButtonGroupItem']),
    usageCode: `<ToggleButtonGroup value={mode} onValueChange={setMode}>
  <ToggleButtonGroupItem value="mix">Mix</ToggleButtonGroupItem>
  <ToggleButtonGroupItem value="solo">Solo</ToggleButtonGroupItem>
</ToggleButtonGroup>`,
    exampleCode: `"use client"

import * as React from "react"
import {
  ToggleButtonGroup,
  ToggleButtonGroupItem,
} from "@/registry/components/analog/ToggleButtonGroup"

export function ToggleButtonGroupExample() {
  const [mode, setMode] = React.useState("mix")

  return (
    <ToggleButtonGroup value={mode} onValueChange={setMode} aria-label="Signal mode">
      <ToggleButtonGroupItem value="mix" width="4.75rem">
        Mix
      </ToggleButtonGroupItem>
      <ToggleButtonGroupItem value="solo" width="4.75rem" variant="black">
        Solo
      </ToggleButtonGroupItem>
      <ToggleButtonGroupItem value="mute" width="4.75rem" indicatorTone="destructive">
        Mute
      </ToggleButtonGroupItem>
    </ToggleButtonGroup>
  )
}`,
    api: [
      {
        title: 'ToggleButtonGroup',
        description: 'A Base UI toggle group styled as a recessed plunger-button bank.',
        props: [
          {
            name: 'value',
            type: 'string',
            description: 'Controlled selected item value.',
          },
          {
            name: 'defaultValue',
            type: 'string',
            description: 'Initial uncontrolled selected item value.',
          },
          {
            name: 'onValueChange',
            type: '(value: string, details: ToggleButtonGroupChangeDetails) => void',
            description: 'Receives the next selected item value and Base UI change details.',
          },
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Controls group flow and keyboard orientation.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Default plunger material finish for child items.',
          },
          {
            name: 'indicatorTone',
            type: 'AnalogTone',
            defaultValue: 'undefined',
            description: 'Default indicator tone for child items.',
          },
          {
            name: 'indicatorActive',
            type: '"auto" | "always" | "never"',
            defaultValue: '"auto"',
            description: 'Controls when child item indicators light.',
          },
          {
            name: 'allowEmpty',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Allows the active item to be toggled off.',
          },
          {
            name: 'itemHeight',
            type: 'React.CSSProperties["height"]',
            defaultValue: '"3.5rem"',
            description: 'Default item height for child toggles.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '32',
            description: 'Default rendered plunger depth for child toggles.',
          },
          lightingProp,
          classNameProp,
          styleProp,
        ],
      },
      {
        title: 'ToggleButtonGroupItem',
        description: 'A push toggle item with optional link behavior.',
        props: [
          {
            name: 'value',
            type: 'string',
            description: 'Unique item value used by the parent group.',
          },
          {
            name: 'href',
            type: 'string',
            description: 'Renders the item as a link while preserving toggle styling.',
          },
          {
            name: 'target / rel / download',
            type: 'HTMLAttributeAnchorTarget / string / AnchorHTMLAttributes["download"]',
            description: 'Anchor metadata forwarded when href is provided.',
          },
          {
            name: 'width / height',
            type: 'React.CSSProperties',
            description:
              'Sets the item footprint. Omit width to size from the label with built-in padding.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'group default',
            description: 'Overrides the item material finish.',
          },
          {
            name: 'indicatorTone',
            type: 'AnalogTone',
            defaultValue: 'group default',
            description: 'Overrides the item indicator tone.',
          },
          {
            name: 'indicatorActive',
            type: '"auto" | "always" | "never"',
            defaultValue: 'group default',
            description: 'Controls when this item indicator lights.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '32',
            description: 'Controls rendered plunger depth.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Plunger face content.',
          },
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  switch: {
    usageIntro:
      'Use Switch for boolean state with a cylindrical thumb that rolls through a recessed track.',
    registryImportCode: registryImport(['Switch'], 'Switch'),
    packageImportCode: packageImport(['Switch']),
    usageCode: `<Switch defaultChecked />`,
    exampleCode: `"use client"

import * as React from "react"
import { Switch } from "@/registry/components/analog/Switch"

export function SwitchExample() {
  const [checked, setChecked] = React.useState(true)

  return (
    <Switch
      checked={checked}
      onCheckedChange={setChecked}
    />
  )
}`,
    api: [
      {
        title: 'Switch',
        description:
          'A Base UI switch root with Analog UI track, cylinder thumb, and orientation support.',
        props: [
          { name: 'checked', type: 'boolean', description: 'Controlled switch state.' },
          { name: 'defaultChecked', type: 'boolean', description: 'Initial uncontrolled state.' },
          {
            name: 'onCheckedChange',
            type: '(checked: boolean) => void',
            description: 'Receives state changes.',
          },
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Changes track direction.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the cylinder material finish.',
          },
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  'rotary-switch': {
    usageIntro:
      'Use RotarySwitch for limited integer selection with visible detents, a fluted black selector ring, and a machined Dial-style center cap.',
    registryImportCode: registryImport(['RotarySwitch'], 'RotarySwitch'),
    packageImportCode: packageImport(['RotarySwitch']),
    usageCode: `<RotarySwitch defaultValue={3} min={0} max={6} />`,
    exampleCode: `"use client"

import * as React from "react"
import { RotarySwitch } from "@/registry/components/analog/RotarySwitch"

const marks = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
]

export function RotarySwitchExample() {
  const [value, setValue] = React.useState(3)

  return (
    <RotarySwitch
      value={value}
      onValueChange={(next) => setValue(next as number)}
      min={0}
      max={6}
      marks={marks}
      showMarks
      aria-label="Channel selector"
    />
  )
}`,
    composition: {
      description:
        'RotarySwitch keeps Base UI slider value, keyboard, and input semantics under the finished radial control while exposing the selector hardware, cap, detents, and marks as replaceable layers.',
      tree: `RotarySwitch
|- Root / Base UI slider behavior
|- Hidden Thumb Input / Base UI range semantics
|- Scale
|  |- Detents (\`renderDetent\`)
|  +- Marks (\`renderMark\`)
|- Knob Stack (\`renderKnob\`)
|  |- Fluted Rotor
|  +- Pointer Stripe (\`renderPointer\`)
+- Center Cap (\`renderCap\`)
   +- SurfaceButton`,
      customizeTitle: 'Custom Pointer Stripe',
      customizeDescription:
        'Use renderPointer when the fluted selector and cap should stay intact but the position indicator needs a different material or readout color.',
      customizeCode: `import { RotarySwitch } from "@/registry/components/analog/RotarySwitch"

export function CustomPointerRotarySwitch() {
  return (
    <RotarySwitch
      defaultValue={3}
      min={0}
      max={6}
      renderPointer={({ className, style }) => (
        <div
          className={className}
          style={{
            ...style,
            background:
              "linear-gradient(180deg, rgb(186 230 253), rgb(14 165 233))",
            boxShadow:
              "0 0 0 1px rgba(125, 211, 252, 0.8), 0 0 12px rgba(56, 189, 248, 0.75)",
          }}
        />
      )}
    />
  )
}`,
    },
    api: [
      {
        title: 'RotarySwitch',
        description:
          'A detented rotary selector with radial pointer travel, Base UI keyboard semantics, and whole-integer updates.',
        props: [
          {
            name: 'value',
            type: 'number | readonly number[]',
            description: 'Controlled switch value. Values are displayed as whole integers.',
          },
          {
            name: 'defaultValue',
            type: 'number | readonly number[]',
            description: 'Initial uncontrolled value.',
          },
          {
            name: 'onValueChange',
            type: '(value: number) => void',
            description: 'Receives drag and keyboard updates.',
          },
          {
            name: 'disabled',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Disables drag, pointer, and keyboard interaction.',
          },
          {
            name: 'min / max',
            type: 'number',
            defaultValue: '0 / 6',
            description: 'Integer domain bounds.',
          },
          {
            name: 'startAngle',
            type: 'number',
            defaultValue: '-135',
            description: 'Start of the selectable arc.',
          },
          {
            name: 'sweepAngle',
            type: 'number',
            defaultValue: '270',
            description: 'Selectable arc length in degrees.',
          },
          {
            name: 'marks',
            type: 'RotarySwitchMark[]',
            description: 'Optional labels placed around the selectable arc.',
          },
          {
            name: 'showMarks',
            type: 'boolean',
            defaultValue: 'true when marks are provided',
            description: 'Controls whether mark labels render.',
          },
          {
            name: 'showDetents',
            type: 'boolean',
            defaultValue: 'true',
            description: 'Controls whether integer detent ticks render around the arc.',
          },
          {
            name: 'renderKnob',
            type: '(props: RotarySwitchRenderKnobProps) => React.ReactNode',
            description: 'Replaces the fluted selector stack while keeping root behavior.',
          },
          {
            name: 'renderPointer',
            type: '(props: RotarySwitchRenderPointerProps) => React.ReactNode',
            description: 'Replaces the rotating position stripe inside the selector.',
          },
          {
            name: 'renderCap',
            type: '(props: RotarySwitchRenderCapProps) => React.ReactNode',
            description: 'Replaces the center cap surface.',
          },
          {
            name: 'renderMark',
            type: '(props: RotarySwitchRenderMarkProps) => React.ReactNode',
            description: 'Replaces each resolved scale label around the selectable arc.',
          },
          {
            name: 'renderDetent',
            type: '(props: RotarySwitchRenderDetentProps) => React.ReactNode',
            description: 'Replaces each integer detent tick.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'RotarySwitchRenderState',
        description: 'Shared resolved state passed to all RotarySwitch render slots.',
        props: [
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'startAngle / sweepAngle',
            type: 'number',
            description: 'Resolved selectable arc geometry.',
          },
          {
            name: 'rotationAngle / knobRotation',
            type: 'number',
            description: 'Pointer angle and visual knob rotation in degrees.',
          },
          {
            name: 'disabled',
            type: 'boolean | undefined',
            description: 'Whether the switch is disabled.',
          },
        ],
      },
      {
        title: 'RotarySwitchRenderKnob',
        description: 'Props passed to renderKnob for the full fluted selector stack.',
        props: [
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default selector stack classes and transform styles.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Default pointer and cap layers to place inside a custom knob.',
          },
        ],
      },
      {
        title: 'RotarySwitchRenderPointer',
        description: 'Props passed to renderPointer for the rotating position stripe.',
        props: [
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default pointer stripe classes and styles.',
          },
        ],
      },
      {
        title: 'RotarySwitchRenderCap',
        description: 'Props passed to renderCap for the center cap surface.',
        props: [
          lightingProp,
          {
            name: 'containerClassName / surfaceContainerClassName / surfaceClassName',
            type: 'string',
            description: 'Default cap wrapper and SurfaceButton classes.',
          },
          {
            name: 'surfaceStyle',
            type: 'React.CSSProperties',
            description: 'Default SurfaceButton style for the center cap.',
          },
        ],
      },
      {
        title: 'RotarySwitchRenderMark',
        description: 'Props passed to renderMark for each resolved scale label.',
        props: [
          {
            name: 'mark',
            type: 'RotarySwitchResolvedMark',
            description: 'Original mark plus ratio, angle, and labelPosition.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Classes for the default mark element.',
          },
        ],
      },
      {
        title: 'RotarySwitchRenderDetent',
        description: 'Props passed to renderDetent for each integer tick.',
        props: [
          {
            name: 'detent',
            type: 'RotarySwitchResolvedDetent',
            description: 'Resolved value, ratio, angle, selection state, and tick endpoints.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Classes for the default detent element.',
          },
        ],
      },
    ],
  },
  'wheel-select': {
    usageIntro: 'Use WheelSelect when options should be stepped through like a trim wheel.',
    registryImportCode: registryImport(['WheelSelect'], 'WheelSelect'),
    packageImportCode: packageImport(['WheelSelect']),
    usageCode: `<WheelSelect options={["LOW", "MID", "HIGH"]} defaultValue="MID" infinite />`,
    exampleCode: `"use client"

import * as React from "react"
import { WheelSelect } from "@/registry/components/analog/WheelSelect"

const options = ["PITCH DOWN", "NEUTRAL", "PITCH UP"]

export function WheelSelectExample() {
  const [value, setValue] = React.useState(options[1])

  return (
    <WheelSelect
      options={options}
      value={value}
      onValueChange={setValue}
      infinite
    />
  )
}`,
    api: [
      {
        title: 'WheelSelect',
        description: 'A draggable and wheel-scrollable option selector.',
        props: [
          { name: 'options', type: 'string[]', description: 'Labels rendered on the wheel.' },
          { name: 'value', type: 'string', description: 'Controlled selected option.' },
          { name: 'defaultValue', type: 'string', description: 'Initial uncontrolled option.' },
          {
            name: 'onValueChange',
            type: '(value: string) => void',
            description: 'Receives selected option changes.',
          },
          {
            name: 'selectedIndex',
            type: 'number',
            description: 'Controlled selected index alternative.',
          },
          {
            name: 'defaultSelectedIndex',
            type: 'number',
            description: 'Initial uncontrolled selected index.',
          },
          {
            name: 'onSelectedIndexChange',
            type: '(index: number) => void',
            description: 'Receives selected index changes alongside value updates.',
          },
          {
            name: 'getOptionLabel',
            type: '(index: number) => string | undefined',
            description: 'Generates labels for index-backed wheel options.',
          },
          {
            name: 'minIndex / maxIndex',
            type: 'number',
            description: 'Bounds for generated index labels.',
          },
          {
            name: 'infinite',
            type: 'boolean',
            description: 'Allows the wheel to wrap around the option list.',
          },
          {
            name: 'grabDirection / scrollDirection',
            type: '"up" | "down"',
            defaultValue: '"down"',
            description: 'Controls which interaction direction advances values.',
          },
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  'wheel-number': {
    usageIntro:
      'Use WheelNumber for fine numeric scrubbing with drag, wheel, keyboard, and stepper controls.',
    registryImportCode: registryImport(['WheelNumber'], 'WheelNumber'),
    packageImportCode: packageImport(['WheelNumber']),
    usageCode: `<WheelNumber defaultValue={0} min={-12} max={12} />`,
    exampleCode: `"use client"

import * as React from "react"
import { WheelNumber } from "@/registry/components/analog/WheelNumber"

export function WheelNumberExample() {
  const [value, setValue] = React.useState(0)

  return (
    <WheelNumber
      value={value}
      onValueChange={(next) => setValue(next ?? 0)}
      min={-12}
      max={12}
      step={1}
    />
  )
}`,
    api: [
      {
        title: 'WheelNumber',
        description: 'A Base UI number field with a tactile wheel interaction surface.',
        props: [
          { name: 'value', type: 'number | null', description: 'Controlled numeric value.' },
          { name: 'defaultValue', type: 'number', description: 'Initial uncontrolled value.' },
          {
            name: 'onValueChange',
            type: '(value: number | null, details: NumberField.ChangeEventDetails) => void',
            description: 'Receives value changes and Base UI change details.',
          },
          { name: 'min / max', type: 'number', description: 'Optional numeric bounds.' },
          {
            name: 'step',
            type: 'number | "any"',
            defaultValue: '1',
            description: 'Main increment.',
          },
          {
            name: 'smallStep / largeStep',
            type: 'number',
            defaultValue: '0.1 / 10',
            description: 'Alt and shift step sizes.',
          },
          {
            name: 'grabDirection / scrollDirection',
            type: '"up" | "down"',
            defaultValue: '"down"',
            description: 'Controls which interaction direction increases values.',
          },
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  gauge: {
    usageIntro:
      'Use Gauge for radial segmented-display feedback with optional marks, sweep geometry, and slider input.',
    registryImportCode: registryImport(['Gauge'], 'Gauge'),
    packageImportCode: packageImport(['Gauge']),
    usageCode: `<Gauge defaultValue={42} min={0} max={100} tone="success" />`,
    exampleCode: `"use client"

import * as React from "react"
import { Gauge } from "@/registry/components/analog/Gauge"

export function GaugeExample() {
  const [value, setValue] = React.useState(42)

  return (
    <Gauge
      value={value}
      onValueChange={(next) => setValue(next as number)}
      min={0}
      max={100}
      marks={[
        { value: 0, label: "0" },
        { value: 50, label: "50" },
        { value: 100, label: "100" },
      ]}
    />
  )
}`,
    composition: {
      description:
        'Gauge keeps the Base UI slider behavior while exposing the radial track, illuminated indicator, scale marks, and center pointer as replaceable hardware layers.',
      tree: `Gauge
|- Root / Base UI slider behavior
|- Hidden Slider Control
|- Scale SVG
|  |- Track Arc (\`renderTrack\`)
|  |- Indicator Fill (\`renderIndicator\`)
|  +- Marks (\`renderMark\`)
+- Pointer (\`renderPointer\`)
   +- SurfaceButton`,
      customizeTitle: 'Custom Pointer',
      customizeDescription:
        'Use renderPointer when the gauge needs a different knob or read pointer but should keep the same radial math, drag behavior, and keyboard semantics.',
      customizeCode: `import { Gauge } from "@/registry/components/analog/Gauge"

export function CustomPointerGauge() {
  return (
    <Gauge
      defaultValue={64}
      min={0}
      max={100}
      tone="success"
      renderPointer={({ className, style, rotationAngle }) => (
        <div className={className} style={style}>
          <div className="relative h-full w-full rounded-full border border-emerald-300/35 bg-zinc-950 shadow-[inset_0_2px_10px_rgba(255,255,255,0.16),0_8px_24px_rgba(0,0,0,0.45)]">
            <div
              className="absolute inset-0"
              style={{ transform: \`rotate(\${rotationAngle}deg)\` }}
            >
              <div className="absolute left-1/2 top-[12%] h-[30%] w-1 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_12px_var(--analog-display-glow)]" />
            </div>
          </div>
        </div>
      )}
    />
  )
}`,
    },
    api: [
      {
        title: 'Gauge',
        description: 'A Base UI slider root rendered as a radial segmented display gauge.',
        props: [
          { name: 'value', type: 'number | number[]', description: 'Controlled gauge value.' },
          {
            name: 'defaultValue',
            type: 'number | number[]',
            description: 'Initial uncontrolled value.',
          },
          {
            name: 'onValueChange',
            type: '(value: number | number[]) => void',
            description: 'Receives drag and keyboard updates.',
          },
          {
            name: 'min / max',
            type: 'number',
            defaultValue: '0 / 100',
            description: 'Slider domain mapped onto the radial gauge.',
          },
          {
            name: 'tone',
            type: 'AnalogTone',
            defaultValue: '"success"',
            description: 'Sets the gauge fill tone.',
          },
          {
            name: 'startAngle',
            type: 'number',
            defaultValue: '-135',
            description: 'Start of the gauge arc.',
          },
          {
            name: 'sweepAngle',
            type: 'number',
            defaultValue: '270',
            description: 'Arc length in degrees.',
          },
          {
            name: 'marks',
            type: 'GaugeMark[]',
            description: 'Optional scale marks around the arc.',
          },
          {
            name: 'showMarks',
            type: 'boolean',
            defaultValue: 'marks !== undefined',
            description: 'Controls whether provided marks are rendered.',
          },
          {
            name: 'fillMode',
            type: '"start" | "center"',
            defaultValue: '"start"',
            description: 'Controls whether fill grows from the start or from centerValue.',
          },
          {
            name: 'centerValue',
            type: 'number',
            description: 'Value used as the fill origin when fillMode is "center".',
          },
          {
            name: 'trackClassName / indicatorClassName / markClassName / pointerClassName',
            type: 'string',
            description: 'Adds classes to the default hardware layers.',
          },
          {
            name: 'renderTrack',
            type: '(props: GaugeRenderTrackProps) => React.ReactNode',
            description: 'Replaces the background radial track arc.',
          },
          {
            name: 'renderIndicator',
            type: '(props: GaugeRenderIndicatorProps) => React.ReactNode',
            description: 'Replaces the illuminated fill layer.',
          },
          {
            name: 'renderMark',
            type: '(props: GaugeRenderMarkProps) => React.ReactNode',
            description: 'Replaces each resolved scale mark.',
          },
          {
            name: 'renderPointer',
            type: '(props: GaugeRenderPointerProps) => React.ReactNode',
            description: 'Replaces the central pointer hardware.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'GaugeRenderTrack',
        description: 'Props passed to renderTrack for the background arc.',
        props: [
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'startAngle / sweepAngle',
            type: 'number',
            description: 'Resolved radial geometry in degrees.',
          },
          {
            name: 'filterId',
            type: 'string',
            description: 'Unique SVG filter id for the default inset shadow.',
          },
          {
            name: 'tone / className',
            type: 'AnalogTone / string',
            description: 'Current tone and classes for the default slot.',
          },
        ],
      },
      {
        title: 'GaugeRenderIndicator',
        description: 'Props passed to renderIndicator for the illuminated fill layer.',
        props: [
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'fillMode / centerValue',
            type: '"start" | "center" / number',
            description: 'Fill origin mode and resolved center value.',
          },
          {
            name: 'startAngle / sweepAngle',
            type: 'number',
            description: 'Resolved radial geometry in degrees.',
          },
          {
            name: 'fillStart / fillLength',
            type: 'number',
            description: 'Arc offsets in degrees for the active fill.',
          },
          {
            name: 'maskId / noiseId',
            type: 'string',
            description: 'Unique SVG ids for matching the default fill mask and grain.',
          },
          {
            name: 'glowColor / fillColor',
            type: 'string',
            description: 'Resolved display colors for the default indicator.',
          },
          {
            name: 'tone / className',
            type: 'AnalogTone / string',
            description: 'Current tone and classes for the default slot.',
          },
        ],
      },
      {
        title: 'GaugeRenderMark',
        description: 'Props passed to renderMark for each resolved scale mark.',
        props: [
          {
            name: 'mark',
            type: 'GaugeResolvedMark',
            description: 'Original mark plus ratio, angle, tick points, and label position.',
          },
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'tone / className',
            type: 'AnalogTone / string',
            description: 'Current tone and classes for the default slot.',
          },
        ],
      },
      {
        title: 'GaugeRenderPointer',
        description: 'Props passed to renderPointer for the central hardware layer.',
        props: [
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'rotationAngle / pointerBevelAngle',
            type: 'number / string',
            description: 'Resolved pointer rotation and light-relative bevel angle.',
          },
          {
            name: 'tone',
            type: 'AnalogTone',
            description: 'Current tone for pointer-aware custom hardware.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Positioning classes and inset style for the pointer slot.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Default pointer indicator line, useful inside a custom shell.',
          },
        ],
      },
    ],
  },
  'lcd-display': {
    usageIntro:
      'Use LCDDisplay for compact labels, values, and units with a glowing segmented readout treatment.',
    registryImportCode: registryImport(['LCDDisplay'], 'LCDDisplay'),
    packageImportCode: packageImport(['LCDDisplay']),
    usageCode: `<LCDDisplay label="Output Trim" value="-12.8" units="DB" digits={5} tone="success" />`,
    exampleCode: `import { LCDDisplay } from "@/registry/components/analog/LCDDisplay"

export function LCDDisplayExample() {
  return (
    <LCDDisplay
      label="Output Trim"
      value="-12.8"
      units="DB"
      digits={5}
      tone="success"
      size="lg"
    />
  )
}`,
    api: [
      {
        title: 'LCDDisplay',
        description: 'A seven-segment-style display shell with label, units, and sizing controls.',
        props: [
          {
            name: 'value',
            type: 'string | number',
            defaultValue: '"88.8"',
            description: 'Primary readout value.',
          },
          {
            name: 'label',
            type: 'React.ReactNode',
            description: 'Optional label above the value.',
          },
          {
            name: 'units',
            type: 'React.ReactNode',
            description: 'Optional unit label beside the value.',
          },
          {
            name: 'tone',
            type: 'AnalogTone',
            defaultValue: '"success"',
            description: 'Sets the display glass tone.',
          },
          {
            name: 'size',
            type: '"sm" | "md" | "lg"',
            defaultValue: '"md"',
            description: 'Controls shell and typography scale.',
          },
          {
            name: 'digits',
            type: 'number',
            description: 'Pads the value to a fixed character count.',
          },
          {
            name: 'align',
            type: '"left" | "center" | "right"',
            defaultValue: '"right"',
            description: 'Aligns padded display text.',
          },
          {
            name: 'screenClassName / valueClassName',
            type: 'string',
            description: 'Adds classes to internal display areas.',
          },
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  'needle-gauge': {
    usageIntro:
      'Use NeedleGauge for a mechanical readout with preset or custom scale marks and zones.',
    registryImportCode: registryImport(['NeedleGauge'], 'NeedleGauge'),
    packageImportCode: packageImport(['NeedleGauge']),
    usageCode: `<NeedleGauge value={-3} scalePreset="vu" label="OUTPUT" unit="VU" />`,
    exampleCode: `import { NeedleGauge } from "@/registry/components/analog/NeedleGauge"

export function NeedleGaugeExample() {
  return (
    <NeedleGauge
      value={-3}
      scalePreset="vu"
      label="OUTPUT"
      unit="VU"
    />
  )
}`,
    composition: {
      description:
        'NeedleGauge keeps the Base UI meter semantics and spring motion while exposing the printed scale, needle, hub, readout, and lens as replaceable hardware layers.',
      tree: `NeedleGauge
|- Root / Base UI meter behavior
|- Shell
|  +- Slot / Face
|     |- Scale Artwork
|     |  |- Zones
|     |  |- Ticks
|     |  +- Marks
|     |- Needle
|     |- Hub
|     |- Readout
|     +- Lens`,
      customizeTitle: 'Custom Needle',
      customizeDescription:
        'Use renderNeedle or renderHub when the gauge needs a different pointer style but should keep the same scale math, animation, and accessibility.',
      customizeCode: `import { NeedleGauge } from "@/registry/components/analog/NeedleGauge"

export function CustomNeedleGauge() {
  return (
    <NeedleGauge
      value={-3}
      scalePreset="vu"
      label="OUTPUT"
      unit="VU"
      renderNeedle={({ className, style }) => (
        <div
          className={className}
          style={{
            ...style,
            width: "0.32rem",
            clipPath: "polygon(44% 0%, 56% 0%, 62% 88%, 50% 100%, 38% 88%)",
            background:
              "linear-gradient(calc(var(--analog-light-angle-pointer, 180deg) - 90deg), var(--analog-meter-zone-warning), var(--analog-emissive-core))",
          }}
        />
      )}
      renderHub={({ className, surfaceClassName, surfaceStyle, children }) => (
        <div className={className}>
          <div
            className={surfaceClassName}
            style={{
              ...surfaceStyle,
              boxShadow:
                "inset 0 1px 1px rgba(255,255,255,0.45), 0 0 12px color-mix(in oklch, var(--analog-emissive-glow) 18%, transparent)",
            }}
          >
            {children}
          </div>
        </div>
      )}
    />
  )
}`,
    },
    api: [
      {
        title: 'NeedleGauge',
        description:
          'A mechanical gauge with printed marks, range zones, glass, and a physical needle.',
        props: [
          {
            name: 'value',
            type: 'number',
            defaultValue: '0',
            description: 'Current needle value.',
          },
          {
            name: 'min / max',
            type: 'number',
            defaultValue: 'preset',
            description: 'Custom value range.',
          },
          {
            name: 'scalePreset',
            type: '"linear" | "dbfs" | "vu"',
            defaultValue: '"linear"',
            description: 'Preset marks and range behavior.',
          },
          {
            name: 'startAngle / sweepAngle',
            type: 'number',
            defaultValue: '195 / 150',
            description: 'Arc geometry for the printed scale and needle travel.',
          },
          { name: 'marks', type: 'NeedleGaugeMark[]', description: 'Custom printed scale marks.' },
          {
            name: 'zones',
            type: 'NeedleGaugeZone[]',
            description: 'Colored range bands behind the scale.',
          },
          {
            name: 'minorTickCount',
            type: 'number',
            defaultValue: '40',
            description: 'Number of minor tick marks between the major scale artwork.',
          },
          { name: 'label', type: 'React.ReactNode', description: 'Optional center label.' },
          { name: 'unit', type: 'React.ReactNode', description: 'Optional unit label.' },
          {
            name: 'showValue',
            type: 'boolean',
            defaultValue: 'true',
            description: 'Controls whether the numeric readout renders.',
          },
          {
            name: 'valueFormatter',
            type: '(value: number) => React.ReactNode',
            description: 'Formats the numeric value shown in the readout.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the case material finish.',
          },
          {
            name: 'needleVariant',
            type: '"tone" | "chrome"',
            defaultValue: '"tone"',
            description: 'Sets whether the needle uses the tone color or chrome finish.',
          },
          {
            name: 'needleTone',
            type: 'AnalogTone',
            defaultValue: '"destructive"',
            description: 'Sets the tone-driven needle color.',
          },
          {
            name: 'animationDuration',
            type: 'number',
            defaultValue: '420',
            description: 'Fallback transition duration in milliseconds when spring is disabled.',
          },
          {
            name: 'spring',
            type: 'boolean | NeedleGaugeSpringConfig',
            defaultValue: 'true',
            description: 'Enables spring-driven needle animation or overrides spring settings.',
          },
          {
            name: 'scaleClassName / needleClassName / hubClassName',
            type: 'string',
            description: 'Adds classes to the default scale, needle, or hub layer.',
          },
          {
            name: 'readoutClassName / lensClassName',
            type: 'string',
            description: 'Adds classes to the default readout or lens layer.',
          },
          {
            name: 'renderScale',
            type: '(props: NeedleGaugeRenderScaleProps) => React.ReactNode',
            description:
              'Replaces the scale artwork while receiving resolved marks, zones, and ticks.',
          },
          {
            name: 'renderNeedle',
            type: '(props: NeedleGaugeRenderNeedleProps) => React.ReactNode',
            description: 'Replaces the animated needle layer.',
          },
          {
            name: 'renderHub',
            type: '(props: NeedleGaugeRenderHubProps) => React.ReactNode',
            description: 'Replaces the center hub while receiving the default hub surface.',
          },
          {
            name: 'renderReadout',
            type: '(props: NeedleGaugeRenderReadoutProps) => React.ReactNode',
            description: 'Replaces the label, value, and unit readout layer.',
          },
          {
            name: 'renderLens',
            type: '(props: NeedleGaugeRenderLensProps) => React.ReactNode',
            description: 'Replaces the optical lens reflection layer.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'NeedleGaugeRenderScale',
        description: 'Props passed to renderScale for the printed gauge scale.',
        props: [
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'startAngle / sweepAngle',
            type: 'number',
            description: 'Resolved arc geometry in degrees.',
          },
          {
            name: 'geometry',
            type: 'NeedleGaugeGeometry',
            description: 'SVG layout geometry used by the default scale.',
          },
          {
            name: 'marks / zones / minorTicks',
            type: 'NeedleGaugeResolvedMark[] / NeedleGaugeResolvedZone[] / NeedleGaugeResolvedTick[]',
            description: 'Resolved scale data ready for custom rendering.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Default SVG scale classes.',
          },
        ],
      },
      {
        title: 'NeedleGaugeRenderNeedle',
        description: 'Props passed to renderNeedle for the animated pointer layer.',
        props: [
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'needleAngle / needleRotation',
            type: 'number',
            description: 'Target absolute angle and CSS rotation.',
          },
          {
            name: 'displayNeedleAngle / displayNeedleRotation',
            type: 'number',
            description: 'Animated angle and rotation currently displayed.',
          },
          {
            name: 'transition',
            type: 'string',
            description: 'CSS transition used when spring animation is disabled.',
          },
          {
            name: 'needleVariant / tone',
            type: 'NeedleGaugeNeedleVariant / AnalogTone',
            description: 'Resolved needle material mode and tone color.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default needle classes and animated style.',
          },
        ],
      },
      {
        title: 'NeedleGaugeRenderHub',
        description: 'Props passed to renderHub for the center cap.',
        props: [
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'variant',
            type: 'AnalogMaterialVariant',
            description: 'Resolved shell material variant.',
          },
          {
            name: 'displayNeedleRotation / transition',
            type: 'number / string',
            description: 'Animated rotation state for synchronized hub effects.',
          },
          {
            name: 'className / surfaceClassName / surfaceStyle',
            type: 'string / string / React.CSSProperties',
            description: 'Default hub wrapper and surface presentation.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Default holographic hub layers.',
          },
        ],
      },
      {
        title: 'NeedleGaugeRenderReadout',
        description: 'Props passed to renderReadout for label and value text.',
        props: [
          {
            name: 'label / unit / formattedValue',
            type: 'React.ReactNode',
            description: 'Resolved readout content.',
          },
          {
            name: 'value / min / max / ratio',
            type: 'number',
            description: 'Resolved value state and normalized position.',
          },
          {
            name: 'showValue',
            type: 'boolean',
            description: 'Whether the value should render.',
          },
          {
            name: 'className / labelClassName / valueClassName / unitClassName',
            type: 'string',
            description: 'Default readout classes.',
          },
        ],
      },
      {
        title: 'NeedleGaugeRenderLens',
        description: 'Props passed to renderLens for the optical glass layer.',
        props: [
          {
            name: 'variant / tone',
            type: 'AnalogMaterialVariant / AnalogTone',
            description: 'Resolved shell material and needle tone.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default lens classes and lighting style.',
          },
        ],
      },
    ],
  },
  meter: {
    usageIntro:
      'Use Meter for calibrated level feedback, or compose a stereo display with the meter group helpers.',
    registryImportCode: registryImport(
      ['Meter', 'MeterGroup', 'MeterGroupChannel', 'MeterGroupSeparator'],
      'Meter',
    ),
    packageImportCode: packageImport([
      'Meter',
      'MeterGroup',
      'MeterGroupChannel',
      'MeterGroupSeparator',
    ]),
    usageCode: `<Meter value={72} peakValue={88} orientation="vertical" />`,
    exampleCode: `import {
  Meter,
  MeterGroup,
  MeterGroupChannel,
  MeterGroupSeparator,
} from "@/registry/components/analog/Meter"

export function MeterExample() {
  return (
    <MeterGroup aria-label="Stereo output meter">
      <MeterGroupChannel label="L">
        <Meter value={72} peakValue={88} orientation="vertical" />
      </MeterGroupChannel>
      <MeterGroupSeparator />
      <MeterGroupChannel label="R">
        <Meter value={64} peakValue={82} orientation="vertical" />
      </MeterGroupChannel>
    </MeterGroup>
  )
}`,
    composition: {
      description:
        'Meter keeps the calibrated Base UI meter behavior while exposing the channel display as interchangeable physical layers.',
      tree: `Meter
|- Root / Base UI meter behavior
|- Scale
|- Track / Cavity
|  |- Glow
|  |- Indicator
|  |  |- Fill
|  |  +- Noise
|  |- Peak Marker
|  |- Segment Grille
|  +- Lens
+- MeterGroup helpers`,
      customizeTitle: 'Custom VU Channel',
      customizeDescription:
        'Use the render slots when a VU-style channel needs a custom fill, peak treatment, or glass layer without rebuilding ballistics and scale behavior.',
      customizeCode: `import { Meter } from "@/registry/components/analog/Meter"

export function CustomVuMeter() {
  return (
    <Meter
      value={-3}
      peakValue={1}
      min={-20}
      max={3}
      orientation="vertical"
      scalePreset="vu"
      showScale
      segments={26}
      renderIndicator={({ className, style, fillStyle, children }) => (
        <div className={className} style={style}>
          <div
            className="absolute inset-x-[2px] inset-y-0 rounded-full"
            style={{
              ...fillStyle,
              background:
                "linear-gradient(to top, var(--analog-meter-zone-success) 0%, var(--analog-meter-zone-success) 70%, var(--analog-meter-zone-warning) 86%, var(--analog-meter-zone-destructive) 100%)",
            }}
          />
          {children}
        </div>
      )}
      renderLens={({ className, style }) => (
        <div
          className={className}
          style={{
            ...style,
            opacity: 0.62,
            background:
              "linear-gradient(var(--analog-light-angle-lens, 180deg), rgba(255,255,255,0.22), transparent 42%, rgba(0,0,0,0.38))",
          }}
        />
      )}
    />
  )
}`,
    },
    api: [
      {
        title: 'Meter',
        description: 'A Base UI meter root rendered as an analog segmented channel display.',
        props: [
          { name: 'value', type: 'number', defaultValue: '0', description: 'Current meter value.' },
          { name: 'peakValue', type: 'number', description: 'Optional peak hold marker.' },
          {
            name: 'min / max',
            type: 'number',
            defaultValue: '0 / 100',
            description: 'Value range.',
          },
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Display direction.',
          },
          {
            name: 'variant',
            type: '"metered" | "display"',
            defaultValue: '"metered"',
            description: 'Segment color model.',
          },
          {
            name: 'tone',
            type: 'AnalogTone',
            defaultValue: '"success"',
            description: 'Sets the display tone when variant is "display".',
          },
          {
            name: 'segments',
            type: 'number',
            description: 'Number of rendered meter segments.',
          },
          {
            name: 'scalePreset',
            type: '"linear" | "dbfs" | "vu"',
            defaultValue: '"linear"',
            description: 'Preset scale and zone behavior.',
          },
          {
            name: 'marks',
            type: 'MeterMark[]',
            description: 'Custom scale labels with optional normalized positions.',
          },
          {
            name: 'showScale',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Controls whether the scale layer renders.',
          },
          {
            name: 'scaleSide',
            type: '"leading" | "trailing"',
            defaultValue: '"leading"',
            description: 'Places the default scale labels before or after the track.',
          },
          {
            name: 'zones',
            type: 'MeterZone[]',
            description: 'Custom color ranges for metered fills.',
          },
          {
            name: 'ballistics',
            type: 'MeterBallistics',
            description: 'Controls meter attack, release, and peak hold timing.',
          },
          {
            name: 'scaleClassName / scaleMarkClassName',
            type: 'string',
            description: 'Adds classes to the default scale container or individual scale marks.',
          },
          {
            name: 'trackClassName',
            type: 'string',
            description: 'Adds classes to the default meter track cavity.',
          },
          {
            name: 'indicatorClassName',
            type: 'string',
            description: 'Adds classes to the default clipped indicator layer.',
          },
          {
            name: 'peakMarkerClassName',
            type: 'string',
            description: 'Adds classes to the default peak marker.',
          },
          {
            name: 'segmentsClassName / lensClassName',
            type: 'string',
            description: 'Adds classes to the default segment grille or lens reflection.',
          },
          {
            name: 'renderScale',
            type: '(props: MeterRenderScaleProps) => React.ReactNode',
            description: 'Replaces the scale layer while receiving resolved marks and side.',
          },
          {
            name: 'renderTrack',
            type: '(props: MeterRenderTrackProps) => React.ReactNode',
            description: 'Replaces the track cavity; render props.children to keep inner layers.',
          },
          {
            name: 'renderIndicator',
            type: '(props: MeterRenderIndicatorProps) => React.ReactNode',
            description: 'Replaces the clipped lit fill and receives the default fill style.',
          },
          {
            name: 'renderPeakMarker',
            type: '(props: MeterRenderPeakMarkerProps) => React.ReactNode',
            description: 'Replaces the held peak marker.',
          },
          {
            name: 'renderSegments / renderLens',
            type: '(props) => React.ReactNode',
            description: 'Replaces the segment grille or optical lens layer.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'MeterRenderScale',
        description: 'Props passed to renderScale for the calibrated scale layer.',
        props: [
          {
            name: 'orientation / isVertical',
            type: '"horizontal" | "vertical" / boolean',
            description: 'Current meter axis and convenience boolean.',
          },
          {
            name: 'scaleSide',
            type: '"leading" | "trailing"',
            description: 'Resolved side for the scale labels.',
          },
          {
            name: 'marks',
            type: 'MeterResolvedMark[]',
            description: 'Resolved marks including normalized ratio.',
          },
          {
            name: 'className / markClassName',
            type: 'string',
            description: 'Default classes for the scale shell and mark labels.',
          },
        ],
      },
      {
        title: 'MeterRenderTrack',
        description: 'Props passed to renderTrack for the visual meter cavity.',
        props: [
          {
            name: 'orientation / isVertical',
            type: '"horizontal" | "vertical" / boolean',
            description: 'Current meter axis and convenience boolean.',
          },
          {
            name: 'value / min / max',
            type: 'number',
            description: 'Resolved meter domain state.',
          },
          {
            name: 'percentage / peakPercentage',
            type: 'number / number | null',
            description: 'Normalized fill and peak positions.',
          },
          {
            name: 'variant / tone',
            type: 'MeterVariant / AnalogTone',
            description: 'Resolved meter finish and active tone.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default track classes and lighting style.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Default glow, indicator, peak, segments, and lens layers.',
          },
        ],
      },
      {
        title: 'MeterRenderIndicator',
        description: 'Props passed to renderIndicator for the clipped fill layer.',
        props: [
          {
            name: 'orientation / isVertical',
            type: '"horizontal" | "vertical" / boolean',
            description: 'Current meter axis and convenience boolean.',
          },
          {
            name: 'value / min / max / percentage',
            type: 'number',
            description: 'Resolved meter domain state and normalized fill position.',
          },
          {
            name: 'clipPath / transitionMs',
            type: 'string / number',
            description: 'Resolved clipping and ballistics timing.',
          },
          {
            name: 'variant / tone',
            type: 'MeterVariant / AnalogTone',
            description: 'Resolved meter finish and active tone.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default indicator wrapper classes and clip style.',
          },
          {
            name: 'fillClassName / fillStyle',
            type: 'string / React.CSSProperties',
            description: 'Default fill classes and zone gradient style.',
          },
          {
            name: 'children',
            type: 'React.ReactNode',
            description: 'Default noise overlay.',
          },
        ],
      },
      {
        title: 'MeterRenderPeakMarker',
        description: 'Props passed to renderPeakMarker for the held peak indicator.',
        props: [
          {
            name: 'orientation / isVertical',
            type: '"horizontal" | "vertical" / boolean',
            description: 'Current meter axis and convenience boolean.',
          },
          {
            name: 'value / min / max',
            type: 'number',
            description: 'Resolved peak value and meter domain.',
          },
          {
            name: 'percentage',
            type: 'number',
            description: 'Normalized peak position.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default peak marker classes and resolved position style.',
          },
        ],
      },
      {
        title: 'MeterRenderSegments',
        description: 'Props passed to renderSegments for the segment grille overlay.',
        props: [
          {
            name: 'orientation / isVertical',
            type: '"horizontal" | "vertical" / boolean',
            description: 'Current meter axis and convenience boolean.',
          },
          {
            name: 'segments',
            type: 'number',
            description: 'Resolved segment count.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default segment overlay classes and resolved grille style.',
          },
        ],
      },
      {
        title: 'MeterRenderLens',
        description: 'Props passed to renderLens for the optical glass layer.',
        props: [
          {
            name: 'orientation / isVertical',
            type: '"horizontal" | "vertical" / boolean',
            description: 'Current meter axis and convenience boolean.',
          },
          {
            name: 'variant / tone',
            type: 'MeterVariant / AnalogTone',
            description: 'Resolved meter finish and tone.',
          },
          {
            name: 'className / style',
            type: 'string / React.CSSProperties',
            description: 'Default lens classes and lighting style.',
          },
        ],
      },
      {
        title: 'MeterGroup',
        description: 'Layout helpers for channel groups and separators.',
        props: [
          {
            name: 'orientation',
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: 'Direction used for group layout and child channel defaults.',
          },
          {
            name: 'variant',
            type: '"panel" | "chrome" | "black"',
            defaultValue: '"panel"',
            description: 'Sets the group shell material.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'MeterGroupChannel',
        description: 'Labeled channel wrapper for meters inside a MeterGroup.',
        props: [
          {
            name: 'label',
            type: 'React.ReactNode',
            description: 'Channel label for MeterGroupChannel.',
          },
          {
            name: 'labelPosition',
            type: '"top" | "bottom" | "left" | "right"',
            defaultValue: 'group orientation dependent',
            description: 'Places the channel label around the meter.',
          },
          classNameProp,
        ],
      },
      {
        title: 'MeterGroupSeparator',
        description: 'Visual separator that follows the parent MeterGroup orientation.',
        props: [classNameProp, styleProp],
      },
    ],
  },
  indicator: {
    usageIntro:
      'Use Indicator for jewel-like status lights with optional bezel, shape, and color states.',
    registryImportCode: registryImport(['Indicator'], 'Indicator'),
    packageImportCode: packageImport(['Indicator']),
    usageCode: `<Indicator isOn tone="warning" size="lg" />`,
    exampleCode: `"use client"

import * as React from "react"
import { Indicator } from "@/registry/components/analog/Indicator"
import { Switch } from "@/registry/components/analog/Switch"

export function IndicatorExample() {
  const [isOn, setIsOn] = React.useState(true)

  return (
    <div className="flex items-center gap-4">
      <Indicator isOn={isOn} tone="warning" size="lg" />
      <Switch checked={isOn} onCheckedChange={setIsOn} />
    </div>
  )
}`,
    api: [
      {
        title: 'Indicator',
        description: 'A status lamp with faceted lens, bloom, and optional machined bezel.',
        props: [
          {
            name: 'isOn',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Controls whether the lamp is lit.',
          },
          {
            name: 'tone',
            type: 'AnalogTone',
            defaultValue: '"accent"',
            description: 'Sets the indicator tone.',
          },
          {
            name: 'size',
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            defaultValue: '"md"',
            description: 'Controls lamp size.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets bezel material. Use disableBezel to hide the bezel.',
          },
          {
            name: 'disableBezel',
            type: 'boolean',
            defaultValue: 'false',
            description: 'Renders only the lens and glow.',
          },
          {
            name: 'shape',
            type: '"round" | "square"',
            defaultValue: '"round"',
            description: 'Controls lens and bezel shape.',
          },
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  panel: {
    usageIntro:
      'Use Panel as a structured equipment bay for dense controls, readouts, and action areas.',
    registryImportCode: registryImport(
      ['Panel', 'PanelHeader', 'PanelTitle', 'PanelDescription', 'PanelContent', 'PanelFooter'],
      'Panel',
    ),
    packageImportCode: packageImport([
      'Panel',
      'PanelHeader',
      'PanelTitle',
      'PanelDescription',
      'PanelContent',
      'PanelFooter',
    ]),
    usageCode: `<Panel variant="rack" screws>
  <PanelHeader>
    <PanelTitle>Master Bus</PanelTitle>
  </PanelHeader>
  <PanelContent>Controls go here.</PanelContent>
</Panel>`,
    exampleCode: `"use client"

import * as React from "react"
import {
  Panel,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
} from "@/registry/components/analog/Panel"
import { PushToggle } from "@/registry/components/analog/PushToggle"

export function PanelExample() {
  const [bypass, setBypass] = React.useState(false)

  return (
    <Panel variant="rack" screws className="max-w-md">
      <PanelHeader>
        <PanelTitle>Master Bus</PanelTitle>
        <PanelDescription>Dynamics and output controls</PanelDescription>
      </PanelHeader>
      <PanelContent>
        <div className="text-sm text-[var(--analog-panel-muted)]">
          Add controls, meters, and readouts here.
        </div>
      </PanelContent>
      <PanelFooter>
        <PushToggle
          className="w-full"
          indicatorTone="warning"
          pressed={bypass}
          onPressedChange={setBypass}
        >
          Bypass
        </PushToggle>
      </PanelFooter>
    </Panel>
  )
}`,
    api: [
      {
        title: 'Panel',
        description: 'A structured panel shell with optional screw hardware and layout slots.',
        props: [
          {
            name: 'variant',
            type: '"default" | "rack"',
            defaultValue: '"default"',
            description: 'Sets the panel surface style.',
          },
          {
            name: 'surface',
            type: '"default" | "subtle"',
            defaultValue: '"default"',
            description: 'Reduces the center hotspot for nested or secondary panel surfaces.',
          },
          {
            name: 'screws',
            type: 'boolean',
            defaultValue: 'true',
            description: 'Controls corner screw rendering.',
          },
          {
            name: 'screwVariant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets screw material finish.',
          },
          {
            name: 'screwHole',
            type: '"none" | "slot" | "cross" | "star"',
            defaultValue: '"none"',
            description: 'Adds screw head detail.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'Panel Slots',
        description: 'Slot components inherit regular HTML div or heading attributes.',
        props: [
          {
            name: 'PanelHeader',
            type: 'HTMLAttributes<HTMLDivElement>',
            description: 'Header spacing and title stack.',
          },
          {
            name: 'PanelTitle',
            type: 'HTMLAttributes<HTMLHeadingElement>',
            description: 'Panel title text.',
          },
          {
            name: 'PanelDescription',
            type: 'HTMLAttributes<HTMLParagraphElement>',
            description: 'Muted supporting text.',
          },
          {
            name: 'PanelContent',
            type: 'HTMLAttributes<HTMLDivElement>',
            description: 'Primary content area.',
          },
          {
            name: 'PanelFooter',
            type: 'HTMLAttributes<HTMLDivElement>',
            description: 'Footer action area.',
          },
        ],
      },
    ],
  },
};

export function getComponentPageDoc(name: ComponentName) {
  return componentDocs[name];
}
