import { TaskMonthlyPeriod } from './TaskMonthlyPeriod';
import { TaskWeeklyPeriod } from './TaskWeeklyPeriod';
import { MajorCategory } from './MajorCategory';
import { MiddleCategory } from './MiddleCategory';
import { MinorCategory } from './MinorCategory';
import { TaskSpecifiedPeriod } from './TaskSpecifiedPeriod';
import { TaskAnnuallyPeriod } from './TaskAnnuallyPeriod';
/**
 * Model Task
 */

export type BasisType = 'DEADLINE' | 'ACTUAL';

export type PeriodType = 'WEEKLY' | 'MONTHLY' | 'ANNUALLY' | 'SPECIFIED';

export type LeadTimeType = 'DAYS' | 'WEEKS' | 'MONTHS';

export type Task = {
  id: number;
  organizationId: number;
  taskCode: string;
  title: string;
  departmentId: number | null;
  majorCategoryId: number | null;
  middleCategoryId: number | null;
  minorCategoryId: number | null;
  majorCategory: MajorCategory;
  middleCategory: MiddleCategory;
  minorCategory: MinorCategory;
  basisType: BasisType | null;
  periodType: PeriodType | null;
  isConductedHoliday: boolean;
  leadTimeType: LeadTimeType | null;
  leadTimeDay: number;
  memo: string | null;
  isDeleted: boolean;
  createdAt: Date;
  createdBy: number;
  modifiedAt: Date;
  modifiedBy: number;
  favoriteTasks: Task[];
  taskWeeklyPeriods: TaskWeeklyPeriod[];
  taskMonthlyPeriods: TaskMonthlyPeriod[];
  taskSpecifiedPeriods: TaskSpecifiedPeriod[];
  taskTransactions: Transaction[];
  taskAnnuallyPeriods: TaskAnnuallyPeriod[];
};

export type TransactionProcess = {
  id: number;
  content: string;
  createdAt: string;
  createdBy: number;
  deletedAt?: string;
  departmentId?: number;
  isDeleted: boolean;
  modifiedAt: string;
  modifiedBy: number;
  orderNo: number;
  status: boolean;
  transactionId: number;
};

export type Transaction = {
  id: number;
  taskId: number;
  title: string;
  status: number;
  startDate: Date;
  completionDate: Date;
  practitioner: string;
  memo: string;
  reason: string;
  createdAt: number;
  owner: {
    id: number;
    name: string;
  };
  transactionProcesses: TransactionProcess[];
  task?: Task;
  favoriteTransactions: Transaction[];
};
