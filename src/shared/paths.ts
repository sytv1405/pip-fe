const tasks = '/tasks';
const masters = '/masters';

export const paths = {
  home: '/',
  tasks: {
    index: tasks,
    search: `${tasks}/search`,
    new: `${tasks}/new`,
    show: `${tasks}/[taskCode]`,
    edit: `${tasks}/[taskCode]/edit`,
    detail: `${tasks}/[taskCode]`,
    bulkUpdate: `${tasks}/bulkUpdate`,
    selection: `${tasks}/select`,
    // basic mode
    monthly: `${tasks}/monthly`,
    businessInMonth: `${tasks}/business-month`,
    businessInYear: `${tasks}/business-year`,
  },
  businessUnitSearch: '/businessUnit/search',
  master: {
    departments: {
      index: `${masters}/departments`,
      edit: `${masters}/departments/[id]/edit`,
    },
    regulations: {
      index: `${masters}/regulations`,
      edit: `${masters}/regulations/[id]/edit`,
    },
    regulationTypes: {
      index: `${masters}/regulationTypes`,
    },
    tasksBatchRegistration: `${masters}/tasksBatchRegistration`,
    userOrganizations: {
      index: `${masters}/userOrganizations`,
      edit: `${masters}/userOrganizations/[id]/edit`,
    },
    users: {
      index: `${masters}/users`,
      edit: `${masters}/users/[id]/edit`,
    },
    businessUnit: {
      index: `${masters}/businessUnit`,
      largeEdit: `${masters}/businessUnit/large/[id]/edit`,
      mediumEdit: `${masters}/businessUnit/medium/[id]/edit`,
      smallEdit: `${masters}/businessUnit/small/[id]/edit`,
    },
    transactionBatchRegistration: `${masters}/transactionBatchRegistration`,
  },
  // basic mode
  tasksByBusinessUnit: '/tasksByBusinessUnit',
  // public
  forgotPassword: '/forgot-password',
} as const;

export const BASIC_MODE_ONLY_PATHNAMES = [
  paths.tasksByBusinessUnit,
  paths.tasks.monthly,
  paths.tasks.businessInMonth,
  paths.tasks.businessInYear,
];
export const ALL_MODES_PATHNAMES = [paths.home, paths.tasks.search, paths.tasks.detail, paths.tasks.edit];
