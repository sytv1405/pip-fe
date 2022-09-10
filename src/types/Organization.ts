export type Organization = {
  id: number;
  name: string;
  organizationCode: string;
  telephoneNumber: string;
  referenceUrl: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: Date;
  createdBy: number;
  modifiedAt: Date;
  modifiedBy: number;
};
