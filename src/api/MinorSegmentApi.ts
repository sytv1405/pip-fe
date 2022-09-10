import { MinorSegment } from '@/types';

import { client } from './client';

type MinorSegmentRequestParams = Pick<MinorSegment, 'id' | 'name' | 'middleSegmentId'>;

export const MinorSegmentApi = {
  findMany: async (middleSegmentId: MinorSegment['middleSegmentId']): Promise<Array<MinorSegment>> => {
    return client.get(`middle-segments/${middleSegmentId}/minor-segments`);
  },

  findUnique: async (minorSegmentId: MinorSegment['id']): Promise<MinorSegment> => {
    return client.get<MinorSegment>(`minor-segments/${minorSegmentId}`);
  },

  create: async (data: Pick<MinorSegment, 'name' | 'middleSegmentId'>): Promise<MinorSegment> => {
    return client.post<MinorSegment>(`middle-segments/${data.middleSegmentId}/minor-segments`, data);
  },

  update: async (data: MinorSegmentRequestParams): Promise<MinorSegment> => {
    return client.patch<MinorSegment>(`minor-segments/${data.id}`, data);
  },

  upsert: async (data: MinorSegmentRequestParams): Promise<MinorSegment> => {
    return data.id ? MinorSegmentApi.update(data) : MinorSegmentApi.create(data);
  },

  delete: async (id: MinorSegment['id']): Promise<void> => {
    await client.delete(`minor-segments/${id}`);
  },
};
