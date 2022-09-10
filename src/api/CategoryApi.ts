import { BulkInsertCategory } from '@/types';

import { client } from './client';

export const CategoryApi = {
  buldInsert: async (
    data: Array<BulkInsertCategory>
  ): Promise<{
    majorCategoryAffectedRows: number;
    middleCategoryAffectedRows: number;
    minorCategoryAffectedRows: number;
  }> => {
    return client.post<{
      majorCategoryAffectedRows: number;
      middleCategoryAffectedRows: number;
      minorCategoryAffectedRows: number;
    }>('categories/bulk-insert', data);
  },
};
