const ANALOG_REGISTRY_ORIGIN = 'https://analogui.com';
const ANALOG_FOUNDATION_HREF = '/r/analog-foundation.json';

export const packageInstallSnippet = 'pnpm add analog-ui';

export function getRegistryInstallSnippet(registryHref: string) {
  return `pnpm dlx shadcn@latest add ${ANALOG_REGISTRY_ORIGIN}${ANALOG_FOUNDATION_HREF}
pnpm dlx shadcn@latest add ${ANALOG_REGISTRY_ORIGIN}${registryHref}`;
}
