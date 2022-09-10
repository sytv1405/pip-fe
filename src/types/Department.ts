import { MajorCategory } from './MajorCategory';
import { Objectliteral } from './objectliteral';

export type Department = {
  id: number;
  organizationId: number;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
  createdBy: number;
  modifiedAt: Date;
  modifiedBy: number;
  hasTaskNoUnit?: boolean;
  majorCategories?: (MajorCategory & { isShowBusinessTasks?: boolean; businessTasks?: Objectliteral[] })[];
  businessTasks?: Objectliteral[];
};
