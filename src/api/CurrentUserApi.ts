import { User, Organization, Department } from '@/types';

import { client } from './client';

export const CurrentUserApi = {
  findUnique: async (): Promise<User & { organization: Organization; department: Department }> => {
    return client.get<User & { organization: Organization; department: Department }>('me');
  },
};
