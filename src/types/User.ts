import { Organization } from './Organization';
import { Department } from './Department';

type UserRole = 'SERVICE_ADMIN' | 'ORGANIZATION_ADMIN' | 'USER';

export type User = {
  id: number;
  organizationId: number;
  organization: Organization;
  departmentId: number;
  name: string;
  cognitoUuid: string;
  email: string;
  userRole: UserRole;
  isDeleted: boolean;
  createdAt: Date;
  createdBy: number;
  modifiedAt: Date;
  modifiedBy: number;
  department: Department;
};
