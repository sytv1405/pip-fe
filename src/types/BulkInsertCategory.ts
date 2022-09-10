import { MiddleCategory } from '@/types/MiddleCategory';
import { MajorCategory } from '@/types/MajorCategory';
import { MinorCategory } from '@/types/MinorCategory';

export type BulkInsertCategory = {
  majorCategory: Pick<MajorCategory, 'name'>;
  middleCategory: Pick<MiddleCategory, 'name'>;
  minorCategory: Pick<MinorCategory, 'name'>;
};
