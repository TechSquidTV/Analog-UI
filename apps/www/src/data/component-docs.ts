import type { BlockName } from './block-catalog';

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

interface ComponentPageDoc {
  usageIntro: string;
  registryImportCode: string;
  packageImportCode?: string;
  usageCode: string;
  exampleCode: string;
  /** Editorial fallback for generated API docs; source prop names, types, and defaults come from component-api-loader. */
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
  description: 'Overrides resolved light channels for the component materials.',
};

const classNameProp = {
  name: 'className',
  type: 'string',
  description: 'Adds classes to the outer component shell.',
};

export const componentDocs: Record<BlockName, ComponentPageDoc> = {
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
          lightingProp,
          classNameProp,
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
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  toggle: {
    usageIntro: 'Use Toggle when a two-position choice should read like a heavy rocker.',
    registryImportCode: registryImport(['Toggle'], 'Toggle'),
    packageImportCode: packageImport(['Toggle']),
    usageCode: `<Toggle value="right" leftLed="amber" rightLed="green" />`,
    exampleCode: `"use client"

import * as React from "react"
import { Toggle } from "@/registry/components/analog/Toggle"

export function ToggleExample() {
  const [value, setValue] = React.useState<"left" | "right">("right")

  return (
    <Toggle
      value={value}
      onValueChange={setValue}
      leftLed="amber"
      rightLed="green"
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
            name: 'leftLed / rightLed',
            type: 'IndicatorColor',
            defaultValue: '"none"',
            description: 'Adds optional LED indicators on either side.',
          },
          {
            name: 'leftLedActive / rightLedActive',
            type: '"auto" | "always" | "never"',
            defaultValue: '"auto"',
            description: 'Controls when each LED is lit.',
          },
          lightingProp,
          classNameProp,
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
        leftLed="red"
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
            name: 'leftLed / rightLed',
            type: 'IndicatorColor',
            defaultValue: '"amber" / "green"',
            description: 'Default LED colors for child rockers.',
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
            description: 'Short hardware label rendered beside the rocker.',
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
            description: 'Passes through to the nested Toggle.',
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
        ],
      },
    ],
  },
  'push-toggle': {
    usageIntro: 'Use PushToggle for a latching push control with optional LED state feedback.',
    registryImportCode: registryImport(['PushToggle'], 'PushToggle'),
    packageImportCode: packageImport(['PushToggle']),
    usageCode: `<PushToggle defaultPressed indicatorColor="green">ARM</PushToggle>`,
    exampleCode: `"use client"

import * as React from "react"
import { PushToggle } from "@/registry/components/analog/PushToggle"

export function PushToggleExample() {
  const [pressed, setPressed] = React.useState(true)

  return (
    <PushToggle
      pressed={pressed}
      onPressedChange={setPressed}
      indicatorColor="green"
    >
      ARM
    </PushToggle>
  )
}`,
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
            name: 'indicatorColor',
            type: 'IndicatorColor',
            defaultValue: '"none"',
            description: 'Optional LED color on the plunger face.',
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
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  'toggle-button-group': {
    usageIntro:
      'Use ToggleButtonGroup for mutually exclusive push toggles with LED state feedback.',
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
      <ToggleButtonGroupItem value="mute" width="4.75rem" indicatorColor="red">
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
            type: '(value: string) => void',
            description: 'Receives the next selected item value.',
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
            name: 'indicatorColor',
            type: 'IndicatorColor',
            defaultValue: '"green"',
            description: 'Default LED color for child items.',
          },
          {
            name: 'indicatorActive',
            type: '"auto" | "always" | "never"',
            defaultValue: '"auto"',
            description: 'Controls when child item LEDs light.',
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
          lightingProp,
          classNameProp,
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
            name: 'indicatorColor',
            type: 'IndicatorColor',
            defaultValue: 'group default',
            description: 'Overrides the item LED color.',
          },
          {
            name: 'indicatorActive',
            type: '"auto" | "always" | "never"',
            defaultValue: 'group default',
            description: 'Controls when this item LED lights.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '32',
            description: 'Controls rendered plunger depth.',
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
            type: '(value: number | null) => void',
            description: 'Receives value changes.',
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
      'Use Gauge for radial LCD-style feedback with optional marks, sweep geometry, and slider input.',
    registryImportCode: registryImport(['Gauge'], 'Gauge'),
    packageImportCode: packageImport(['Gauge']),
    usageCode: `<Gauge defaultValue={42} min={0} max={100} variant="lcd-green" />`,
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
    api: [
      {
        title: 'Gauge',
        description: 'A Base UI slider root rendered as a radial LCD gauge.',
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
            name: 'variant',
            type: '"lcd-green" | "lcd-amber" | "lcd-blue"',
            defaultValue: '"lcd-green"',
            description: 'Sets LCD color treatment.',
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
            name: 'fillMode',
            type: '"start" | "center"',
            defaultValue: '"start"',
            description: 'Controls whether fill grows from the start or from centerValue.',
          },
          lightingProp,
          classNameProp,
        ],
      },
    ],
  },
  'lcd-display': {
    usageIntro:
      'Use LCDDisplay for compact labels, values, and units with a glowing segmented readout treatment.',
    registryImportCode: registryImport(['LCDDisplay'], 'LCDDisplay'),
    packageImportCode: packageImport(['LCDDisplay']),
    usageCode: `<LCDDisplay label="Output Trim" value="-12.8" units="DB" digits={5} />`,
    exampleCode: `import { LCDDisplay } from "@/registry/components/analog/LCDDisplay"

export function LCDDisplayExample() {
  return (
    <LCDDisplay
      label="Output Trim"
      value="-12.8"
      units="DB"
      digits={5}
      variant="lcd-green"
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
            name: 'variant',
            type: '"lcd-green" | "lcd-amber" | "lcd-blue"',
            defaultValue: '"lcd-green"',
            description: 'Sets LCD color treatment.',
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
          { name: 'marks', type: 'NeedleGaugeMark[]', description: 'Custom printed scale marks.' },
          {
            name: 'zones',
            type: 'NeedleGaugeZone[]',
            description: 'Colored range bands behind the scale.',
          },
          { name: 'label', type: 'React.ReactNode', description: 'Optional center label.' },
          { name: 'unit', type: 'React.ReactNode', description: 'Optional unit label.' },
          {
            name: 'variant',
            type: '"chrome" | "black"',
            defaultValue: 'inherited',
            description: 'Sets the case material finish.',
          },
          {
            name: 'needleVariant',
            type: '"red" | "chrome"',
            defaultValue: '"red"',
            description: 'Sets the needle finish.',
          },
          lightingProp,
          classNameProp,
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
    api: [
      {
        title: 'Meter',
        description: 'A Base UI meter root rendered as an analog LED channel display.',
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
            type: '"metered" | "lcd-green" | "lcd-amber" | "lcd-blue"',
            defaultValue: '"metered"',
            description: 'Segment color model.',
          },
          {
            name: 'segments',
            type: 'number',
            defaultValue: '32',
            description: 'Number of rendered LED segments.',
          },
          {
            name: 'scalePreset',
            type: '"linear" | "dbfs" | "vu"',
            defaultValue: '"linear"',
            description: 'Preset scale and zone behavior.',
          },
          {
            name: 'ballistics',
            type: 'MeterBallistics',
            description: 'Controls meter attack, release, and peak hold timing.',
          },
          lightingProp,
          classNameProp,
        ],
      },
      {
        title: 'MeterGroup',
        description: 'Layout helpers for channel groups and separators.',
        props: [
          {
            name: 'variant',
            type: '"panel" | "chrome" | "black"',
            defaultValue: '"chrome"',
            description: 'Sets the group shell material.',
          },
          {
            name: 'label',
            type: 'React.ReactNode',
            description: 'Channel label for MeterGroupChannel.',
          },
          classNameProp,
        ],
      },
    ],
  },
  indicator: {
    usageIntro:
      'Use Indicator for jewel-like status lights with optional bezel, shape, and color states.',
    registryImportCode: registryImport(['Indicator'], 'Indicator'),
    packageImportCode: packageImport(['Indicator']),
    usageCode: `<Indicator isOn color="amber" size="lg" />`,
    exampleCode: `"use client"

import * as React from "react"
import { Indicator } from "@/registry/components/analog/Indicator"
import { Switch } from "@/registry/components/analog/Switch"

export function IndicatorExample() {
  const [isOn, setIsOn] = React.useState(true)

  return (
    <div className="flex items-center gap-4">
      <Indicator isOn={isOn} color="amber" size="lg" />
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
            name: 'color',
            type: '"red" | "green" | "amber" | "blue" | "white" | "none"',
            defaultValue: '"red"',
            description: 'Sets the LED color.',
          },
          {
            name: 'size',
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            defaultValue: '"md"',
            description: 'Controls lamp size.',
          },
          {
            name: 'variant',
            type: '"chrome" | "black" | "none"',
            defaultValue: 'inherited',
            description: 'Sets bezel material. Use disableBezel for no bezel.',
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
          indicatorColor="amber"
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
  'rocker-thumb-surface': {
    usageIntro:
      'Use RockerThumbSurface when you need the same machined rocker shell used by sliders and switches.',
    registryImportCode: registryImport(['RockerThumbSurface'], 'RockerThumbSurface'),
    usageCode: `<RockerThumbSurface
  className="h-9 w-[88px] rounded-sm"
  orientation="horizontal"
  raisedSide="both"
/>`,
    exampleCode: `import { RockerThumbSurface } from "@/registry/components/analog/RockerThumbSurface"

export function RockerThumbSurfaceExample() {
  return (
    <RockerThumbSurface
      className="h-9 w-[88px] rounded-sm"
      variant="chrome"
      orientation="horizontal"
      raisedSide="both"
    />
  )
}`,
    api: [
      {
        title: 'RockerThumbSurface',
        description:
          'A reusable static rocker shell for custom controls and internal component composition.',
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
            description: 'Changes ridge and bevel direction.',
          },
          {
            name: 'raisedSide',
            type: '"start" | "end" | "both"',
            defaultValue: '"start"',
            description: 'Chooses which half of the rocker is raised.',
          },
          {
            name: 'extrusionLayers',
            type: 'number',
            defaultValue: '24',
            description: 'Controls rendered depth layers.',
          },
          { name: 'children', type: 'React.ReactNode', description: 'Optional face content.' },
          classNameProp,
        ],
      },
    ],
  },
};

export function getComponentPageDoc(name: BlockName) {
  return componentDocs[name];
}
