/**
 * Model TaskSegment
 */

export type TaskSegment = {
  id: number;
  taskId: number;
  majorSegmentId: number | null;
  middleSegmentId: number | null;
  minorSegmentId: number | null;
  referenceItem: string;
  referenceUrl: string;
  isDeleted: boolean;
  createdAt: Date;
  createdBy: number;
  modifiedAt: Date;
  modifiedBy: number;
};
