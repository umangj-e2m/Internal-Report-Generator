import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reportService } from '../services/reportService';
import { reportKeys } from '../utils/reportKeys';

export function useUpdateReportStyle(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (style) => reportService.updateStyle(slug, style),
    onSuccess: (report) => {
      queryClient.setQueryData(reportKeys.detail(slug), report);
    },
  });
}
