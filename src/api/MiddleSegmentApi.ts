import { MajorSegment, MiddleSegment } from '@/types';

import { client } from './client';

type MiddleSegmentRequestParams = Pick<MiddleSegment, 'id' | 'name' | 'majorSegmentId'>;

export const MiddleSegmentApi = {
  findMany: async (majorSegmentId: MajorSegment['id']): Promise<Array<MiddleSegment>> => {
    return client.get(`major-segments/${majorSegmentId}/middle-segments`);
  },

  findUnique: async (middleSegmentId: MiddleSegment['id']): Promise<MiddleSegment> => {
    return client.get<MiddleSegment>(`middle-segments/${middleSegmentId}`);
  },

  create: async (data: Pick<MiddleSegment, 'name' | 'majorSegmentId'>): Promise<MiddleSegment> => {
    return client.post<MiddleSegment>(`major-segments/${data.majorSegmentId}/middle-segments`, data);
  },

  update: async (data: MiddleSegmentRequestParams): Promise<MiddleSegment> => {
    return client.patch<MiddleSegment>(`middle-segments/${data.id}`, data);
  },

  upsert: async (data: MiddleSegmentRequestParams): Promise<MiddleSegment> => {
    return data.id ? MiddleSegmentApi.update(data) : MiddleSegmentApi.create(data);
  },

  delete: async (id: MiddleSegment['id']): Promise<void> => {
    await client.delete(`middle-segments/${id}`);
  },
};
