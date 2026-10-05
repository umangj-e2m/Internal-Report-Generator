import { useQuery } from '@tanstack/react-query';

import { reportService } from '../services/reportService';
import { reportKeys } from '../utils/reportKeys';

export function useStyleOptions() {
  return useQuery({
    queryKey: reportKeys.styleOptions(),
    queryFn: reportService.getStyleOptions,
    staleTime: Infinity,
  });
}
