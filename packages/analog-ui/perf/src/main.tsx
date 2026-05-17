import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AnalogLightingProvider,
  Dial,
  LCDDisplay,
  Panel,
  PanelContent,
  Slider,
  Switch,
  WheelSelect,
  usePointerLighting,
} from '../../src/index';
import './perf.css';

interface ObserverMetrics {
  active: number;
  created: number;
  disconnected: number;
}

interface AnalogPerfMetrics {
  rafScheduled: number;
  rafExecuted: number;
  rectReads: number;
  resizeObservers: ObserverMetrics;
  mutationObservers: ObserverMetrics;
  longTasks: number[];
  frameGaps: number[];
}

interface FrameSummary {
  frameCount: number;
  maxFrameGapMs: number;
  p95FrameGapMs: number;
  longTasks: number[];
}

interface AnalogPerfApi {
  ready: boolean;
  values: Record<string, number | string>;
  resetMetrics: () => void;
  getMetrics: () => AnalogPerfMetrics;
  startFrameProbe: () => void;
  stopFrameProbe: () => FrameSummary;
  setWheelMounted?: (mounted: boolean) => void;
}

declare global {
  interface Window {
    __analogPerf: AnalogPerfApi;
  }
}

const metrics: AnalogPerfMetrics = {
  rafScheduled: 0,
  rafExecuted: 0,
  rectReads: 0,
  resizeObservers: { active: 0, created: 0, disconnected: 0 },
  mutationObservers: { active: 0, created: 0, disconnected: 0 },
  longTasks: [],
  frameGaps: [],
};

let frameProbeHandle: number | null = null;
let lastFrameTime: number | null = null;
let longTaskObserver: PerformanceObserver | null = null;

function cloneObserverMetrics(source: ObserverMetrics): ObserverMetrics {
  return { active: source.active, created: source.created, disconnected: source.disconnected };
}

function getMetrics(): AnalogPerfMetrics {
  return {
    rafScheduled: metrics.rafScheduled,
    rafExecuted: metrics.rafExecuted,
    rectReads: metrics.rectReads,
    resizeObservers: cloneObserverMetrics(metrics.resizeObservers),
    mutationObservers: cloneObserverMetrics(metrics.mutationObservers),
    longTasks: [...metrics.longTasks],
    frameGaps: [...metrics.frameGaps],
  };
}

function resetMetrics() {
  metrics.rafScheduled = 0;
  metrics.rafExecuted = 0;
  metrics.rectReads = 0;
  metrics.longTasks = [];
  metrics.frameGaps = [];
}

function summarizeFrameProbe(): FrameSummary {
  const sortedGaps = [...metrics.frameGaps].sort((a, b) => a - b);
  const p95Index = sortedGaps.length > 0 ? Math.floor((sortedGaps.length - 1) * 0.95) : 0;

  return {
    frameCount: metrics.frameGaps.length,
    maxFrameGapMs: sortedGaps.at(-1) ?? 0,
    p95FrameGapMs: sortedGaps[p95Index] ?? 0,
    longTasks: [...metrics.longTasks],
  };
}

function stopFrameProbe() {
  if (frameProbeHandle !== null) {
    window.cancelAnimationFrame(frameProbeHandle);
    frameProbeHandle = null;
  }

  longTaskObserver?.disconnect();
  longTaskObserver = null;
  lastFrameTime = null;

  return summarizeFrameProbe();
}

function startFrameProbe() {
  stopFrameProbe();
  metrics.longTasks = [];
  metrics.frameGaps = [];

  if (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes.includes('longtask')
  ) {
    longTaskObserver = new PerformanceObserver((list) => {
      metrics.longTasks.push(...list.getEntries().map((entry) => entry.duration));
    });
    longTaskObserver.observe({ type: 'longtask', buffered: false });
  }

  const step = (time: number) => {
    if (lastFrameTime !== null) {
      metrics.frameGaps.push(time - lastFrameTime);
    }

    lastFrameTime = time;
    frameProbeHandle = window.requestAnimationFrame(step);
  };

  frameProbeHandle = window.requestAnimationFrame(step);
}

function installInstrumentation() {
  const originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (callback) => {
    metrics.rafScheduled += 1;

    return originalRequestAnimationFrame((time) => {
      metrics.rafExecuted += 1;
      callback(time);
    });
  };

  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function getInstrumentedBoundingClientRect() {
    if ((this as Element).hasAttribute('data-perf-count-rect')) {
      metrics.rectReads += 1;
    }

    return originalGetBoundingClientRect.call(this);
  };

  const NativeResizeObserver = window.ResizeObserver;
  if (NativeResizeObserver) {
    window.ResizeObserver = class InstrumentedResizeObserver implements ResizeObserver {
      private disconnected = false;
      private tracked = false;
      private readonly observer: ResizeObserver;

      constructor(callback: ResizeObserverCallback) {
        this.observer = new NativeResizeObserver(callback);
      }

      observe(target: Element, options?: ResizeObserverOptions) {
        if (!this.tracked && target.hasAttribute('data-perf-wheel-select')) {
          this.tracked = true;
          metrics.resizeObservers.created += 1;
          metrics.resizeObservers.active += 1;
        }

        this.observer.observe(target, options);
      }

      unobserve(target: Element) {
        this.observer.unobserve(target);
      }

      disconnect() {
        if (!this.disconnected && this.tracked) {
          this.disconnected = true;
          metrics.resizeObservers.active -= 1;
          metrics.resizeObservers.disconnected += 1;
        }

        this.observer.disconnect();
      }
    };
  }

  const NativeMutationObserver = window.MutationObserver;
  if (NativeMutationObserver) {
    window.MutationObserver = class InstrumentedMutationObserver implements MutationObserver {
      private disconnected = false;
      private tracked = false;
      private readonly observer: MutationObserver;

      constructor(callback: MutationCallback) {
        this.observer = new NativeMutationObserver(callback);
      }

      observe(target: Node, options: MutationObserverInit) {
        if (
          !this.tracked &&
          target === document.documentElement &&
          options.attributeFilter?.includes('data-theme')
        ) {
          this.tracked = true;
          metrics.mutationObservers.created += 1;
          metrics.mutationObservers.active += 1;
        }

        this.observer.observe(target, options);
      }

      disconnect() {
        if (!this.disconnected && this.tracked) {
          this.disconnected = true;
          metrics.mutationObservers.active -= 1;
          metrics.mutationObservers.disconnected += 1;
        }

        this.observer.disconnect();
      }

      takeRecords() {
        return this.observer.takeRecords();
      }
    };
  }

  window.__analogPerf = {
    ready: false,
    values: {},
    resetMetrics,
    getMetrics,
    startFrameProbe,
    stopFrameProbe,
  };
}

function StaticLedBank() {
  return (
    <div className="perf-static-bank" aria-hidden="true">
      {Array.from({ length: 48 }, (_, index) => (
        <span key={index} className="perf-static-led" />
      ))}
    </div>
  );
}

function SliderDragCase() {
  const [value, setValue] = useState(20);

  useEffect(() => {
    window.__analogPerf.values.slider = value;
  }, [value]);

  return (
    <AnalogLightingProvider baseAngle={180} power={1}>
      <Panel className="perf-panel" screws={false} variant="rack">
        <PanelContent className="perf-panel-content">
          <p className="perf-title">Slider Drag Perf</p>
          <Slider
            aria-label="Perf slider"
            className="perf-slider-control"
            min={0}
            max={100}
            value={value}
            onValueChange={(next) => setValue(next as number)}
          />
          <div className="perf-slider-value" data-perf-value="slider">
            {Math.round(value)}
          </div>
          <StaticLedBank />
        </PanelContent>
      </Panel>
    </AnalogLightingProvider>
  );
}

function PointerLightingCase() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const sourceAngle = usePointerLighting({
    baseAngle: 180,
    influence: 0.65,
    targetRef: surfaceRef,
  });

  return (
    <AnalogLightingProvider baseAngle={180} sourceAngle={sourceAngle} power={1}>
      <div
        ref={surfaceRef}
        className="perf-lighting-surface"
        data-perf-count-rect
        data-perf-target="lighting-surface"
      >
        <Panel className="perf-lighting-stage" screws={false} variant="rack">
          <div className="perf-lighting-controls">
            <Dial value={35} />
            <Switch checked aria-label="Lighting switch" />
            <LCDDisplay value="LIGHT" />
          </div>
        </Panel>
      </div>
    </AnalogLightingProvider>
  );
}

function LocalLightingCase() {
  const surfaceRef = useRef<HTMLDivElement>(null);

  return (
    <AnalogLightingProvider
      baseAngle={180}
      power={1}
      localLighting={{ enabled: true, surfaceRef, strength: 0.7 }}
    >
      <div
        ref={surfaceRef}
        className="perf-lighting-surface"
        data-perf-count-rect
        data-perf-target="lighting-surface"
      >
        <Panel className="perf-lighting-stage" data-perf-count-rect screws={false} variant="rack">
          <div className="perf-lighting-controls">
            <Dial data-perf-count-rect value={35} />
            <Switch data-perf-count-rect checked aria-label="Lighting switch" />
            <LCDDisplay data-perf-count-rect value="LIGHT" />
          </div>
        </Panel>
      </div>
    </AnalogLightingProvider>
  );
}

function MotionLightingCase() {
  return (
    <AnalogLightingProvider
      baseAngle={180}
      power={1}
      motionLighting={{
        enabled: true,
        requestPermission: 'none',
      }}
    >
      <div className="perf-lighting-surface" data-perf-target="lighting-surface">
        <Panel className="perf-lighting-stage" screws={false} variant="rack">
          <div className="perf-lighting-controls">
            <Dial value={35} />
            <Switch checked aria-label="Motion lighting switch" />
            <LCDDisplay value="TILT" />
          </div>
        </Panel>
      </div>
    </AnalogLightingProvider>
  );
}

function WheelCleanupCase() {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    window.__analogPerf.setWheelMounted = setMounted;

    return () => {
      window.__analogPerf.setWheelMounted = undefined;
    };
  }, []);

  return (
    <AnalogLightingProvider baseAngle={180} power={1}>
      <Panel className="perf-panel" screws={false} variant="rack">
        <PanelContent className="perf-wheel-stage">
          {mounted ? (
            <WheelSelect
              aria-label="Perf wheel select"
              defaultValue="Tape"
              data-perf-wheel-select
              infinite
              options={['Opto', 'FET', 'Tape', 'Bus', 'Clip', 'Foldback']}
            />
          ) : null}
        </PanelContent>
      </Panel>
    </AnalogLightingProvider>
  );
}

function PerfCase() {
  const caseName = new URLSearchParams(window.location.search).get('case') ?? 'slider-drag';

  useEffect(() => {
    window.__analogPerf.ready = true;

    return () => {
      window.__analogPerf.ready = false;
    };
  }, [caseName]);

  if (caseName === 'pointer-lighting') return <PointerLightingCase />;
  if (caseName === 'local-lighting') return <LocalLightingCase />;
  if (caseName === 'motion-lighting') return <MotionLightingCase />;
  if (caseName === 'wheel-cleanup') return <WheelCleanupCase />;

  return <SliderDragCase />;
}

installInstrumentation();

createRoot(document.getElementById('root')!).render(
  <main className="perf-shell">
    <PerfCase />
  </main>,
);
