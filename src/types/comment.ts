export type Comment = {
  createdBy?: number;
  modifiedBy?: number;
  createdAt: Date | string;
  modifiedAt: Date | string;
  deletedAt?: number;
  id: number;
  taskId?: number;
  content: string;
  createdByUser: {
    id: number;
    name: string;
  };
};
