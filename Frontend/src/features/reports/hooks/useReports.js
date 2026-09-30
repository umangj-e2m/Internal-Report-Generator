import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { reportService } from '../services/reportService';
import { reportKeys } from '../utils/reportKeys';

export function useReports({ page, pageSize, search }) {
  const params = { page, pageSize, search };
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => reportService.list(params),
    placeholderData: keepPreviousData,
  });
}
