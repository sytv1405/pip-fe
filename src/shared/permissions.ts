import { paths } from './paths';

export const ROLES = {
  SERVICE_ADMIN: 'SERVICE_ADMIN',
  ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN',
  USER: 'USER',
};

// if not defined => permitted
export const PERMITTED_ROLE_BY_PATHNAMES = {
  [paths.master.userOrganizations.index]: [ROLES.SERVICE_ADMIN],
  [paths.master.userOrganizations.edit]: [ROLES.SERVICE_ADMIN],
  [paths.master.users.index]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.users.edit]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.departments.index]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.departments.edit]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.regulations.index]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.regulations.edit]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.regulationTypes.index]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.tasksBatchRegistration]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.businessUnit.index]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
  [paths.master.transactionBatchRegistration]: [ROLES.SERVICE_ADMIN, ROLES.ORGANIZATION_ADMIN],
};

export const PERMITTED_PATHNAMES_WHEN_ORGANIZATION_WAS_DELETED = [
  paths.home,
  paths.tasks.index,
  paths.tasks.search,
  paths.tasks.detail,
  paths.businessUnitSearch,
  paths.master.departments.index,
  paths.master.regulations.index,
  paths.master.regulationTypes.index,
  paths.master.tasksBatchRegistration,
  paths.master.userOrganizations.index,
  paths.master.users.index,
  paths.master.businessUnit.index,
];
