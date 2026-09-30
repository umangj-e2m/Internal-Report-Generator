import { useQuery } from '@tanstack/react-query';

import { reportService } from '../services/reportService';
import { reportKeys } from '../utils/reportKeys';

const MAX_RETRIES = 2;

export function useReport(slug) {
  return useQuery({
    queryKey: reportKeys.detail(slug),
    queryFn: () => reportService.get(slug),
    enabled: Boolean(slug),
    retry: (failureCount, error) => error?.status !== 404 && failureCount < MAX_RETRIES,
  });
}
