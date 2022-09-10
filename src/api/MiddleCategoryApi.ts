import { MiddleCategory, MajorCategory } from '@/types';

import { client } from './client';

type MiddleCategoryRequestParams = Pick<MiddleCategory, 'id' | 'name' | 'majorCategoryId'>;

export const MiddleCategoryApi = {
  findMany: async (majorCategoryId: MajorCategory['id']): Promise<Array<MiddleCategory>> => {
    return client.get(`major-categories/${majorCategoryId}/middle-categories`);
  },

  findUnique: async (middleCategoryId: MiddleCategory['id']): Promise<MiddleCategory> => {
    return client.get<MiddleCategory>(`middle-categories/${middleCategoryId}`);
  },

  create: async (data: Pick<MiddleCategory, 'name' | 'majorCategoryId'>): Promise<MiddleCategory> => {
    return client.post<MiddleCategory>(`major-categories/${data.majorCategoryId}/middle-categories`, data);
  },

  update: async (data: MiddleCategoryRequestParams): Promise<MiddleCategory> => {
    return client.patch<MiddleCategory>(`middle-categories/${data.id}`, data);
  },

  upsert: async (data: MiddleCategoryRequestParams): Promise<MiddleCategory> => {
    return data.id ? MiddleCategoryApi.update(data) : MiddleCategoryApi.create(data);
  },

  delete: async (id: MiddleCategory['id']): Promise<void> => {
    await client.delete(`middle-categories/${id}`);
  },
};
