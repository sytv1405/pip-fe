import { MajorSegment } from '@/types';

import { client } from './client';

type MajorSegmentRequestParams = Pick<MajorSegment, 'id' | 'name'>;

export const MajorSegmentApi = {
  findMany: async (): Promise<Array<MajorSegment>> => {
    return client.get('major-segments');
  },

  findUnique: async (id: MajorSegment['id']): Promise<MajorSegment> => {
    return client.get<MajorSegment>(`major-segments/${id}`);
  },

  create: async (data: MajorSegmentRequestParams): Promise<MajorSegment> => {
    return client.post<MajorSegment>('major-segments', data);
  },

  update: async (data: MajorSegmentRequestParams): Promise<MajorSegment> => {
    return client.patch<MajorSegment>(`major-segments/${data.id}`, data);
  },

  upsert: async (data: MajorSegmentRequestParams): Promise<MajorSegment> => {
    return data.id ? MajorSegmentApi.update(data) : MajorSegmentApi.create(data);
  },

  delete: async (id: MajorSegment['id']): Promise<void> => {
    await client.delete(`major-segments/${id}`);
  },
};
