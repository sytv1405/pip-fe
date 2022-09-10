import { TaskStatus } from '@/shared/enum';

export const taskBasisTypes = {
  deadline: 'DEADLINE',
  actual: 'ACTUAL',
};

export const taskPeriodTypes = {
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  monthlyNo: 'MONTHLYNO',
  annually: 'ANNUALLY',
  annuallyNo: 'ANNUALLYNO',
  specified: 'SPECIFIED',
};

export const weekDays = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

export const months = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

export const inActivateTaskReasons = {
  systemChange: 'CHANGE',
  registrationError: 'ERROR',
  duplicate: 'DUPLICATE',
};

export const taskStatuses = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
};

export const transactionStatuses = {
  open: 0,
  doing: 1,
  completed: 2,
};

export const leadTimeTypes = {
  days: 'DAYS',
  weeks: 'WEEKS',
  months: 'MONTHS',
};

export const CHOICE_IDENTIFIER_005 = {
  self: 0,
  personInCharge: 1,
};

export const COMPLETE_TRANSACTION_REASON = {
  complete: 'COMPLETE',
  suspend: 'SUSPEND',
  duplicate: 'DUPLICATE',
  change: 'CHANGE',
};

export const MONTHLY_DAY_CODE_SPECIAL = {
  '0': 'begin_of_every_month',
  '99': 'end_of_every_month',
  '41': 'start_month',
  '42': 'middle_month',
  '43': 'end_month',
};

export const ANNUALLY_DAY_CODE_SPECIAL = {
  '0': 'every_year_begin_of_month',
  '99': 'every_year_end_of_month',
  '41': 'every_year_early_of_month',
  '42': 'every_year_middle_of_month',
  '43': 'every_year_late_of_month',
};

export const TRANSACTION_ON_CALENDAR_STATUSES = {
  [transactionStatuses.open]: TaskStatus.OPEN,
  [transactionStatuses.doing]: TaskStatus.DOING,
  [transactionStatuses.completed]: TaskStatus.COMPLETED,
};
