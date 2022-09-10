/**
 * Model TaskMonthlyPeriod
 */

export type TaskMonthlyPeriod = {
  id: number;
  taskId: number;
  specifiedDay: number;
  specifiedNo?: number;
  weekCode?: number;
  createdAt: Date;
};
