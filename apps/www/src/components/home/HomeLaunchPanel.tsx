import * as React from 'react';
import {
  Panel,
  PanelHeader,
  PanelContent,
  PanelTitle,
} from '../../../../../packages/analog-ui/src/index';

interface HomeLaunchPanelProps {
  registryUiCount: number;
  registryItemCount: number;
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Panel screws={false} variant="default">
      <PanelContent className="relative z-10 p-4">
        <div className="micro-label">{label}</div>
        <PanelTitle className="mt-2 text-3xl font-semibold text-white">{value}</PanelTitle>
      </PanelContent>
    </Panel>
  );
}

export default function HomeLaunchPanel({
  registryUiCount,
  registryItemCount,
}: HomeLaunchPanelProps) {
  return (
    <Panel className="flex flex-col" screwHole="slot" variant="rack">
      <PanelHeader className="gap-2 p-6 pb-0">
        <div className="eyebrow mb-4">Install Panel</div>
      </PanelHeader>
      <PanelContent className="grid gap-6 px-6 pb-6 pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Controls" value={registryUiCount} />
          <MetricCard label="Installable Items" value={registryItemCount} />
          <MetricCard label="shadcn Registry" value="/r" />
        </div>
        <div className="mt-6">
          <Panel screws={false} variant="default">
            <PanelContent className="p-4">
              <div className="micro-label">First Install</div>
              <pre className="mt-3 overflow-x-auto font-mono text-xs leading-7 text-[#e6e6e6]">
                <code>{`pnpm dlx shadcn@latest add https://analogui.com/r/analog-foundation.json
pnpm dlx shadcn@latest add https://analogui.com/r/dial.json`}</code>
              </pre>
            </PanelContent>
          </Panel>
        </div>
      </PanelContent>
    </Panel>
  );
}
