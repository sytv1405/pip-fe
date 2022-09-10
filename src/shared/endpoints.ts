export const URL_GET_USER = 'me';

export const URL_GET_DEPARTMENTS = 'departments';
export const URL_SEARCH_DEPARTMENTS = 'departments/search';
export const URL_GET_DEPARTMENTS_ALL_ROLES = 'departments/business';
export const URL_CREATE_DEPARTMENT = 'departments';
export const URL_DELETE_DEPARTMENT = 'departments';
export const URL_UPDATE_DEPARTMENT = 'departments';
export const URL_BULK_UPDATE_DEPARTMENTS = 'departments/bulk-update';
export const URL_BULK_INSERT_DEPARTMENTS = 'departments/bulk-insert';
export const URL_GET_DEPARTMENTS_FOR_BUSINESS_UNIT = 'departments/business';
export const URL_GET_TASK_FOR_REGISTER_BULK_TRANSACTION = 'departments/tasks';

export const URL_GET_ORGANIZATIONS = 'admin/organizations';
export const URL_GET_ORGANIZATION = 'admin/organizations';
export const URL_CREATE_ORGANIZATION = 'admin/organizations';
export const URL_UPDATE_ORGANIZATION = 'admin/organizations';
export const URL_DELETE_ORGANIZATION = 'admin/organizations';

export const URL_GET_USERS = 'admin/users';

export const URL_GET_LARGE_BUSINESS_UNIT = 'major-categories';
export const URL_GET_LARGE_BUSINESS_UNIT_ALL_ROLES = 'major-categories/business';
export const URL_CREATE_LARGE_BUSINESS_UNIT = 'major-categories';
export const URL_UPDATE_LARGE_BUSINESS_UNIT = 'major-categories';
export const URL_DELETE_LARGE_BUSINESS_UNIT = 'major-categories';
export const URL_ORDER_LARGE_BUSINESS_UNIT = 'major-categories/bulk-order';
export const URL_BULK_INSERT_MAJOR = 'major-categories/bulk-insert';

export const URL_GET_MEDIUM_BUSINESS_UNIT = 'middle-categories';
export const URL_GET_MEDIUM_BUSINESS_UNIT_ALL_ROLES = 'middle-categories/business';
export const URL_CREATE_MEDIUM_BUSINESS_UNIT = 'middle-categories';
export const URL_UPDATE_MEDIUM_BUSINESS_UNIT = 'middle-categories';
export const URL_DELETE_MEDIUM_BUSINESS_UNIT = 'middle-categories';
export const URL_ORDER_MEDIUM_BUSINESS_UNIT = 'middle-categories/bulk-order';
export const URL_BULK_INSERT_MIDDLE = 'middle-categories/bulk-insert';

export const URL_GET_SMALL_BUSINESS_UNIT = 'minor-categories';
export const URL_GET_SMALL_BUSINESS_UNIT_ALL_ROLES = 'minor-categories/business';
export const URL_CREATE_SMALL_BUSINESS_UNIT = 'minor-categories';
export const URL_UPDATE_SMALL_BUSINESS_UNIT = 'minor-categories';
export const URL_DELETE_SMALL_BUSINESS_UNIT = 'minor-categories';
export const URL_ORDER_SMALL_BUSINESS_UNIT = 'minor-categories/bulk-order';
export const URL_BULK_INSERT_MINOR = 'minor-categories/bulk-insert';
export const URL_GET_BUSINESS_UNITS_RELATIVE = 'business-units/relative';

export const URL_GET_REGULATIONS = 'regulations';
export const URL_GET_REGULATIONS_ALL_ROLES = 'regulations';
export const URL_GET_REGULATION = 'regulations';
export const URL_CREATE_REGULATION = 'regulations';
export const URL_UPDATE_REGULATION = 'regulations';
export const URL_DELETE_REGULATION = 'regulations';
export const URL_DELETE_REGULATIONS = 'regulations/delete';
export const URL_BULK_INSERT_REGULATIONS = 'regulations/bulk-insert';

export const URL_GET_REGULATION_TYPES = 'regulation-types';
export const URL_GET_REGULATION_TYPES_ALL_ROLES = 'regulation-types';
export const URL_CREATE_REGULATION_TYPES = 'regulation-types/bulk-insert';

export const URL_GET_TASKS = 'tasks/search';
export const URL_BULK_UPDATE_TASKS = 'tasks/bulk-update';
export const URL_CREATE_TASK = 'tasks';
export const URL_UPDATE_TASK = 'tasks';
export const URL_DOWNLOAD_BUSINESS_UNIT = 'download-business-units';
export const URL_GET_TASK_DETAIL = 'tasks';
export const URL_UPDATE_TASK_TRANSACTION = 'tasks/[taskId]/transactions/[id]';
export const URL_CREATE_TASK_TRANSACTION = 'tasks/[taskId]/transactions';
export const URL_BULK_INSERT_TASKS = 'tasks/bulk-insert';
export const URL_GET_TASK_BY_BUSINESS = (departmentId: number) => `departments/${departmentId}/business-tasks`;

export const URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH = 'tasks/business';
export const URL_GET_TASKS_EXPORT_EXCEL = 'tasks/export-excel';
export const URL_GET_TODO_TASKS = 'todo';
export const URL_UPDATE_TASK_TRANSACTION_PROCESS_STATUS = 'transactions/[transactionId]/[transactionProcessId]';
export const URL_GET_TASK_CALENDAR = 'calendars';
export const URL_MARK_TASK_FAVORITE = 'tasks/[taskId]/favorite';
export const URL_MARK_TRANSACTION_FAVORITE = 'transactions/[transactionId]/favorite';
export const URL_GET_TRANSACTIONS = (taskId: number) => `tasks/${taskId}/transactions`;
export const URL_GET_COMMENTS = (taskId: number) => `tasks/${taskId}/comments`;
export const URL_CREATE_COMMENT = (taskId: number) => `tasks/${taskId}/comments`;
export const URL_UPDATE_COMMENT = (taskId: number, commentId: number) => `tasks/${taskId}/comments/${commentId}`;
export const URL_DELETE_COMMENT = (taskId: number, commentId: number) => `tasks/${taskId}/comments/${commentId}`;
export const URL_CREATE_TRANSACTION_BULK = 'transactions/bulk';
export const URL_GET_DEADLINE_TASK = 'tasks/deadline';

export const URL_GET_NOTIFICATIONS = 'notifications';
export const URL_READ_NOTIFICATION = 'notifications/[notificationId]/read';
