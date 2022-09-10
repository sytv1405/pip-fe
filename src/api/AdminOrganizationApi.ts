import { Organization } from '@/types';

import { client } from './client';

type OrganizationRequestParams = Pick<Organization, 'id' | 'name' | 'telephoneNumber' | 'referenceUrl'>;

export const AdminOrganizationApi = {
  findMany: async (): Promise<Array<Organization>> => {
    return client.get('admin/organizations');
  },

  findUnique: async (id: Organization['id']): Promise<Organization> => {
    return client.get<Organization>(`admin/organizations/${id}`);
  },

  create: async (data: OrganizationRequestParams): Promise<Organization> => {
    return client.post<Organization>('admin/organizations', data);
  },

  update: async (data: OrganizationRequestParams): Promise<Organization> => {
    return client.patch<Organization>(`admin/organizations/${data.id}`, data);
  },

  upsert: async (data: OrganizationRequestParams): Promise<Organization> => {
    return data.id ? AdminOrganizationApi.update(data) : AdminOrganizationApi.create(data);
  },

  delete: async (id: Organization['id']): Promise<void> => {
    await client.delete(`admin/organizations/${id}`);
  },
};
