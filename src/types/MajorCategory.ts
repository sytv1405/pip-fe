import { MiddleCategory } from './MiddleCategory';
import { Objectliteral } from './objectliteral';

export type MajorCategory = {
  id: number;
  organizationId: number;
  departmentId?: number;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
  createdBy: number;
  modifiedAt: Date;
  modifiedBy: number;
  hasTaskNoUnit?: boolean;
  middleCategories?: (MiddleCategory & { businessTasks: Objectliteral[] })[];
};
