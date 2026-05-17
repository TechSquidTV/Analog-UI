import { expect, test, type Page } from '@playwright/test';

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

declare global {
  interface Window {
    __analogPerf: {
      ready: boolean;
      values: Record<string, number | string>;
      resetMetrics: () => void;
      getMetrics: () => AnalogPerfMetrics;
      startFrameProbe: () => void;
      stopFrameProbe: () => FrameSummary;
      setWheelMounted?: (mounted: boolean) => void;
    };
  }
}

async function openPerfCase(page: Page, caseName: string) {
  await page.goto(`/?case=${caseName}`);
  await page.waitForFunction(() => window.__analogPerf?.ready === true);
}

async function waitForFrames(page: Page, count = 2) {
  await page.evaluate(async (frameCount) => {
    for (let index = 0; index < frameCount; index += 1) {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    }
  }, count);
}

test('usePointerLighting coalesces pointer moves without pointer-time layout reads', async ({
  page,
}) => {
  await openPerfCase(page, 'pointer-lighting');
  await waitForFrames(page, 3);

  const warmupReads = await page.evaluate(async () => {
    window.__analogPerf.resetMetrics();

    const target = document.querySelector<HTMLElement>('[data-perf-target="lighting-surface"]');
    if (!target) throw new Error('Missing lighting surface.');

    target.dispatchEvent(
      new PointerEvent('pointerenter', {
        bubbles: true,
        clientX: 260,
        clientY: 260,
        pointerId: 1,
      }),
    );

    await new Promise((resolve) => window.setTimeout(resolve, 20));

    return window.__analogPerf.getMetrics().rectReads;
  });

  expect(warmupReads).toBe(1);

  const pointerMetrics = await page.evaluate(async () => {
    window.__analogPerf.resetMetrics();

    const target = document.querySelector<HTMLElement>('[data-perf-target="lighting-surface"]');
    if (!target) throw new Error('Missing lighting surface.');

    for (let index = 0; index < 240; index += 1) {
      target.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          clientX: 180 + index,
          clientY: 220 + (index % 30),
          pointerId: 1,
        }),
      );
    }

    await new Promise((resolve) => window.setTimeout(resolve, 50));

    return window.__analogPerf.getMetrics();
  });

  expect(pointerMetrics.rectReads).toBe(0);
  expect(pointerMetrics.rafExecuted).toBeGreaterThanOrEqual(1);
  expect(pointerMetrics.rafScheduled).toBeLessThanOrEqual(2);
});

test('Slider drag stays within the interaction frame budget', async ({ page }) => {
  await openPerfCase(page, 'slider-drag');

  const sliderControl = page.locator('[data-slot="slider-control"]').first();
  await expect(sliderControl).toBeVisible();

  const box = await sliderControl.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const startX = box.x + 18;
  const endX = box.x + box.width - 18;
  const y = box.y + box.height / 2;

  await page.evaluate(() => window.__analogPerf.startFrameProbe());
  await page.mouse.move(startX, y);
  await page.mouse.down();

  for (let step = 1; step <= 48; step += 1) {
    const x = startX + ((endX - startX) * step) / 48;
    await page.mouse.move(x, y);
  }

  await page.mouse.up();
  await waitForFrames(page, 4);

  const summary = await page.evaluate(() => window.__analogPerf.stopFrameProbe());
  const finalValue = await page.evaluate(() => Number(window.__analogPerf.values.slider));
  const p95Budget = process.env.CI ? 55 : 40;

  expect(finalValue).toBeGreaterThan(80);
  expect(summary.frameCount).toBeGreaterThan(8);
  expect(summary.p95FrameGapMs).toBeLessThanOrEqual(p95Budget);
  expect(summary.maxFrameGapMs).toBeLessThanOrEqual(120);
  expect(summary.longTasks).toEqual([]);
});

test('WheelSelect disconnects observers across mount cycles', async ({ page }) => {
  await openPerfCase(page, 'wheel-cleanup');
  await waitForFrames(page, 3);

  const mountedMetrics = await page.evaluate(() => window.__analogPerf.getMetrics());
  expect(mountedMetrics.resizeObservers.active).toBeGreaterThanOrEqual(1);
  expect(mountedMetrics.mutationObservers.active).toBeGreaterThanOrEqual(1);

  for (let cycle = 0; cycle < 6; cycle += 1) {
    await page.evaluate(() => window.__analogPerf.setWheelMounted?.(false));
    await waitForFrames(page, 2);
    await page.evaluate(() => window.__analogPerf.setWheelMounted?.(true));
    await waitForFrames(page, 2);
  }

  await page.evaluate(() => window.__analogPerf.setWheelMounted?.(false));
  await waitForFrames(page, 3);

  const unmountedMetrics = await page.evaluate(() => window.__analogPerf.getMetrics());
  expect(unmountedMetrics.resizeObservers.active).toBe(0);
  expect(unmountedMetrics.mutationObservers.active).toBe(0);
  expect(unmountedMetrics.resizeObservers.disconnected).toBe(
    unmountedMetrics.resizeObservers.created,
  );
  expect(unmountedMetrics.mutationObservers.disconnected).toBe(
    unmountedMetrics.mutationObservers.created,
  );
});
