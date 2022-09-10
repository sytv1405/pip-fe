import {
  Task,
  BasisType,
  Department,
  TaskAnnuallyPeriod,
  TaskAttachment,
  TaskMonthlyPeriod,
  TaskProcess,
  TaskSegment,
  TaskSpecifiedPeriod,
  TaskWeeklyPeriod,
  TaskHistory,
  MajorCategory,
  MiddleCategory,
  MinorCategory,
  MajorSegment,
  MiddleSegment,
  MinorSegment,
  User,
  BulkInsertTask,
} from '@/types';

import { client } from './client';

type SearchParams = {
  basisTypes: Array<BasisType>;
  departmentIds: Array<Department['id']>;
  keyword: string;
};

type TaskRequestParams = Task & {
  taskAttachments: Array<TaskAttachment>;
  taskProcesses: Array<TaskProcess>;
  taskWeeklyPeriods: Array<TaskWeeklyPeriod>;
  taskMonthlyPeriods: Array<TaskMonthlyPeriod>;
  taskAnnuallyPeriods: Array<TaskAnnuallyPeriod>;
  taskSpecifiedPeriods: Array<TaskSpecifiedPeriod>;
  taskSegments: Array<TaskSegment>;
};

export const TaskApi = {
  findUnique: async (
    id: Task['id']
  ): Promise<
    Task & {
      department: Department | null;
      majorCategory: MajorCategory | null;
      middleCategory: MiddleCategory | null;
      minorCategory: MinorCategory | null;
      taskAttachments: Array<TaskAttachment>;
      taskProcesses: Array<TaskProcess & { department: Department | null }>;
      taskWeeklyPeriods: Array<TaskWeeklyPeriod>;
      taskMonthlyPeriods: Array<TaskMonthlyPeriod>;
      taskAnnuallyPeriods: Array<TaskAnnuallyPeriod>;
      taskSpecifiedPeriods: Array<TaskSpecifiedPeriod>;
      taskSegments: Array<
        TaskSegment & {
          majorSegment: MajorSegment | null;
          middleSegment: MiddleSegment | null;
          minorSegment: MinorSegment | null;
        }
      >;
      taskHistories: Array<TaskHistory & { user: User }>;
    }
  > => {
    return client.get<
      Task & {
        department: Department | null;
        majorCategory: MajorCategory | null;
        middleCategory: MiddleCategory | null;
        minorCategory: MinorCategory | null;
        taskAttachments: Array<TaskAttachment>;
        taskProcesses: Array<TaskProcess & { department: Department | null }>;
        taskWeeklyPeriods: Array<TaskWeeklyPeriod>;
        taskMonthlyPeriods: Array<TaskMonthlyPeriod>;
        taskAnnuallyPeriods: Array<TaskAnnuallyPeriod>;
        taskSpecifiedPeriods: Array<TaskSpecifiedPeriod>;
        taskSegments: Array<
          TaskSegment & {
            majorSegment: MajorSegment | null;
            middleSegment: MiddleSegment | null;
            minorSegment: MinorSegment | null;
          }
        >;
        taskHistories: Array<TaskHistory & { user: User }>;
      }
    >(`tasks/${id}`);
  },

  create: async (data: TaskRequestParams): Promise<Task> => {
    return client.post<Task>('tasks', data);
  },

  update: async (data: TaskRequestParams): Promise<Task> => {
    return client.patch<Task>(`tasks/${data.id}`, data);
  },

  upsert: async (data: TaskRequestParams): Promise<Task> => {
    return data.id ? TaskApi.update(data) : TaskApi.create(data);
  },

  buldInsert: async (data: Array<BulkInsertTask>): Promise<{ affectedRows: number }> => {
    return client.post<{ affectedRows: number }>('tasks/bulk-insert', data);
  },

  search: async (data: SearchParams): Promise<Array<Task & { department: Department }>> => {
    return client.get<Array<Task & { department: Department }>>('tasks/search', {
      params: data,
    });
  },
};
