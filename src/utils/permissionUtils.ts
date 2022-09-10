import { PERMITTED_ROLE_BY_PATHNAMES, PERMITTED_PATHNAMES_WHEN_ORGANIZATION_WAS_DELETED } from '@/shared/permissions';
import { Organization } from '@/types';

type IsPermittedParams = {
  pathname: string;
  role: string;
  organization: Organization;
};

export const isPermitted = ({ pathname, role, organization }: IsPermittedParams): boolean => {
  if (!!organization.deletedAt && !(PERMITTED_PATHNAMES_WHEN_ORGANIZATION_WAS_DELETED as string[]).includes(pathname)) {
    return false;
  }

  const permittedRoles = PERMITTED_ROLE_BY_PATHNAMES[pathname];

  // if not define role for pathname => permitted
  if (!permittedRoles) return true;

  return permittedRoles.includes(role);
};
