/**
 * Model TaskAnnuallyPeriod
 */

export type TaskAnnuallyPeriod = {
  id: number;
  taskId: number;
  specifiedMonth: number;
  specifiedDay: number;
  specifiedNo?: number;
  weekCode?: number;
  createdAt: Date;
};
