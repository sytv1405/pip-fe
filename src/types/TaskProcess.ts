/**
 * Model TaskProcess
 */

export type TaskProcess = {
  id: number;
  taskId: number;
  content: string;
  departmentId: number | null;
  outcome: string;
  isDeleted: boolean;
  createdAt: Date;
  createdBy: number;
  modifiedAt: Date;
  modifiedBy: number;
};
