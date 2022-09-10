import { User, Department, Organization } from '@/types';

import { client } from './client';

type UserRequestParams = Pick<
  User & { department: Pick<Department, 'name'> },
  'id' | 'name' | 'organizationId' | 'department' | 'email' | 'userRole'
>;

export const AdminUserApi = {
  findMany: async (): Promise<Array<User & { department: Department; organization: Organization }>> => {
    return client.get('admin/users');
  },

  findUnique: async (id: User['id']): Promise<User & { department: Department }> => {
    return client.get<User & { department: Department }>(`admin/users/${id}`);
  },

  create: async (data: UserRequestParams): Promise<User> => {
    return client.post<User>('admin/users', data);
  },

  update: async (data: UserRequestParams): Promise<User> => {
    return client.patch<User>(`admin/users/${data.id}`, data);
  },

  upsert: async (data: UserRequestParams): Promise<User> => {
    return data.id ? AdminUserApi.update(data) : AdminUserApi.create(data);
  },

  delete: async (id: User['id']): Promise<void> => {
    await client.delete(`admin/users/${id}`);
  },
};
