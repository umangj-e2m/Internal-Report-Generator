import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportService } from '../services/reportService';
import { reportKeys } from '../utils/reportKeys';

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportService.remove,
    onSuccess: (_, slug) => {
      queryClient.removeQueries({ queryKey: reportKeys.detail(slug) });
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
