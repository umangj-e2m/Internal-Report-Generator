import { useCallback } from 'react';

import { useNotification } from './useNotification';

export function useCopyToClipboard() {
  const { notify } = useNotification();

  return useCallback(
    async (text, successMessage = 'Link copied to clipboard') => {
      try {
        await navigator.clipboard.writeText(text);
        notify(successMessage, 'success');
      } catch {
        notify('Could not copy automatically. Please copy the link manually.', 'error');
      }
    },
    [notify],
  );
}
