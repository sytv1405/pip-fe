import { MajorSegment } from '@/types/MajorSegment';
import { MiddleSegment } from '@/types/MiddleSegment';
import { MinorSegment } from '@/types/MinorSegment';

export type BulkInsertSegment = {
  majorSegment: Pick<MajorSegment, 'name'>;
  middleSegment: Pick<MiddleSegment, 'name'>;
  minorSegment: Pick<MinorSegment, 'name'>;
};
