import { MinorCategory } from '@/types';

import { client } from './client';

type MinorCategoryRequestParams = Pick<MinorCategory, 'id' | 'name' | 'middleCategoryId'>;

export const MinorCategoryApi = {
  findMany: async (middleCategoryId: MinorCategory['middleCategoryId']): Promise<Array<MinorCategory>> => {
    return client.get(`middle-categories/${middleCategoryId}/minor-categories`);
  },

  findUnique: async (minorCategoryId: MinorCategory['id']): Promise<MinorCategory> => {
    return client.get<MinorCategory>(`minor-categories/${minorCategoryId}`);
  },

  create: async (data: Pick<MinorCategory, 'name' | 'middleCategoryId'>): Promise<MinorCategory> => {
    return client.post<MinorCategory>(`middle-categories/${data.middleCategoryId}/minor-categories`, data);
  },

  update: async (data: MinorCategoryRequestParams): Promise<MinorCategory> => {
    return client.patch<MinorCategory>(`minor-categories/${data.id}`, data);
  },

  upsert: async (data: MinorCategoryRequestParams): Promise<MinorCategory> => {
    return data.id ? MinorCategoryApi.update(data) : MinorCategoryApi.create(data);
  },

  delete: async (id: MinorCategory['id']): Promise<void> => {
    await client.delete(`minor-categories/${id}`);
  },
};
