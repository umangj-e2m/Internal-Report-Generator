import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportService } from '../services/reportService';
import { reportKeys } from '../utils/reportKeys';

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportService.create,
    onSuccess: (report) => {
      queryClient.setQueryData(reportKeys.detail(report.slug), report);
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
