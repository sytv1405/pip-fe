import { Department } from '@/types';

import { client } from './client';

type DepartmentRequestParams = Pick<Department, 'id' | 'name'>;

export const DepartmentApi = {
  findMany: async (): Promise<Array<Department>> => {
    return client.get('departments');
  },

  findUnique: async (id: Department['id']): Promise<Department> => {
    return client.get<Department>(`departments/${id}`);
  },

  create: async (data: DepartmentRequestParams): Promise<Department> => {
    return client.post<Department>('departments', data);
  },

  update: async (data: DepartmentRequestParams): Promise<Department> => {
    return client.patch<Department>(`departments/${data.id}`, data);
  },

  upsert: async (data: DepartmentRequestParams): Promise<Department> => {
    return data.id ? DepartmentApi.update(data) : DepartmentApi.create(data);
  },

  delete: async (id: Department['id']): Promise<void> => {
    await client.delete(`departments/${id}`);
  },

  buldInsert: async (data: Array<Pick<Department, 'name'>>): Promise<{ affectedRows: number }> => {
    return client.post<{ affectedRows: number }>('departments/bulk-insert', data);
  },
};
