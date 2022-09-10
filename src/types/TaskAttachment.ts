/**
 * Model TaskAttachment
 */

export type TaskAttachment = {
  id: number;
  taskId: number;
  name: string;
  url: string;
  isDeleted: boolean;
  createdAt: Date;
  createdBy: number;
  modifiedAt: Date;
  modifiedBy: number;
};
