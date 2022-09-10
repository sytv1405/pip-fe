import { MiddleCategory } from '@/types/MiddleCategory';
import { Department } from '@/types/Department';
import { MajorCategory } from '@/types/MajorCategory';
import { MinorCategory } from '@/types/MinorCategory';
import { Task } from '@/types/Task';

export type BulkInsertTask = Pick<Task, 'title'> & {
  department: Pick<Department, 'name'>;
  majorCategory: Pick<MajorCategory, 'name'>;
  middleCategory: Pick<MiddleCategory, 'name'>;
  minorCategory: Pick<MinorCategory, 'name'>;
};
