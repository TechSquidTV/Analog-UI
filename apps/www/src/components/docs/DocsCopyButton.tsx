import * as React from 'react';
import { PushButton } from '../../../../../packages/analog-ui/src/index';

const resetDelayMs = 1400;

async function writeClipboardText(text: string) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the selection fallback for embedded browsers.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    const execCommand = (document as unknown as { execCommand: (commandId: string) => boolean })
      .execCommand;

    return execCommand.call(document, 'copy');
  } finally {
    textarea.remove();
  }
}

export default function DocsCopyButton() {
  const [label, setLabel] = React.useState('Copy');
  const resetTimerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    return () => {
      if (resetTimerRef.current !== undefined) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const resetLabelSoon = React.useCallback(() => {
    if (resetTimerRef.current !== undefined) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setLabel('Copy');
      resetTimerRef.current = undefined;
    }, resetDelayMs);
  }, []);

  const handleCopy = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      const root = event.currentTarget.closest('[data-docs-copy-root]');
      const code = root?.querySelector<HTMLElement>('[data-docs-code]');
      const text = code?.textContent?.trimEnd() ?? '';

      try {
        const didCopy = await writeClipboardText(text);
        setLabel(didCopy ? 'Copied' : 'Unavailable');
      } catch {
        setLabel('Failed');
      }

      resetLabelSoon();
    },
    [resetLabelSoon],
  );

  return (
    <PushButton type="button" height="2.25rem" variant="black" data-docs-copy onClick={handleCopy}>
      <span data-docs-copy-label>{label}</span>
    </PushButton>
  );
}
