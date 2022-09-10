import { BulkInsertSegment } from '@/types';

import { client } from './client';

export const SegmentApi = {
  buldInsert: async (
    data: Array<BulkInsertSegment>
  ): Promise<{
    majorSegmentAffectedRows: number;
    middleSegmentAffectedRows: number;
    minorSegmentAffectedRows: number;
  }> => {
    return client.post<{
      majorSegmentAffectedRows: number;
      middleSegmentAffectedRows: number;
      minorSegmentAffectedRows: number;
    }>('segments/bulk-insert', data);
  },
};
