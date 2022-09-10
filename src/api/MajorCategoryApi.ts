import { MajorCategory } from '@/types';

import { client } from './client';

type MajorCategoryRequestParams = Pick<MajorCategory, 'id' | 'name'>;

export const MajorCategoryApi = {
  findMany: async (): Promise<Array<MajorCategory>> => {
    return client.get('majorCategories');
  },

  findUnique: async (id: MajorCategory['id']): Promise<MajorCategory> => {
    return client.get<MajorCategory>(`major-categories/${id}`);
  },

  create: async (data: MajorCategoryRequestParams): Promise<MajorCategory> => {
    return client.post<MajorCategory>('major-categories', data);
  },

  update: async (data: MajorCategoryRequestParams): Promise<MajorCategory> => {
    return client.patch<MajorCategory>(`major-categories/${data.id}`, data);
  },

  upsert: async (data: MajorCategoryRequestParams): Promise<MajorCategory> => {
    return data.id ? MajorCategoryApi.update(data) : MajorCategoryApi.create(data);
  },

  delete: async (id: MajorCategory['id']): Promise<void> => {
    await client.delete(`major-categories/${id}`);
  },
};
