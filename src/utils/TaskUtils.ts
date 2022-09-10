import { Task, TaskWeeklyPeriod, TaskMonthlyPeriod, TaskAnnuallyPeriod, TaskSpecifiedPeriod } from '@/types';
import { dateToJpEra } from '@/utils/dateToJpEra';

export const TaskUtils = {
  getBasisTypeLabel: (params: { basisType: Task['basisType'] }) => {
    switch (params.basisType) {
      case 'DEADLINE':
        return '期限基準';
      case 'ACTUAL':
        return '発生基準';
      default:
        return '';
    }
  },

  getleadTimeTypeLabel: (params: { leadTimeType: Task['leadTimeType'] }) => {
    switch (params.leadTimeType) {
      case 'DAYS':
        return '日間';
      case 'WEEKS':
        return '週間';
      case 'MONTHS':
        return 'ヵ月';
      default:
        return '';
    }
  },

  getTaskPeriodLabel: (
    task: Pick<Task, 'periodType'> & {
      taskWeeklyPeriods: Array<TaskWeeklyPeriod>;
      taskMonthlyPeriods: Array<TaskMonthlyPeriod>;
      taskAnnuallyPeriods: Array<TaskAnnuallyPeriod>;
      taskSpecifiedPeriods: Array<TaskSpecifiedPeriod>;
    }
  ) => {
    switch (task.periodType) {
      case 'WEEKLY':
        return `毎週${TaskUtils.getWeekDayFromWeekCode(task.taskWeeklyPeriods[0]?.weekCode)}`;
      case 'MONTHLY':
        return `毎月${TaskUtils.getSpecifiedDayLabel(task.taskMonthlyPeriods[0]?.specifiedDay)}`;
      case 'ANNUALLY':
        return `毎年${task.taskAnnuallyPeriods[0]?.specifiedMonth}月${TaskUtils.getSpecifiedDayLabel(
          task.taskAnnuallyPeriods[0]?.specifiedDay
        )}`;
      case 'SPECIFIED':
        return task.taskSpecifiedPeriods.map(p => `${dateToJpEra(p.specifiedOn)}  `);
      default:
        return '';
    }
  },

  getWeekDayFromWeekCode: (weekCode?: TaskWeeklyPeriod['weekCode']) => {
    switch (weekCode) {
      case 0:
        return '日曜日';
      case 1:
        return '月曜日';
      case 2:
        return '火曜日';
      case 3:
        return '水曜日';
      case 4:
        return '木曜日';
      case 5:
        return '金曜日';
      case 6:
        return '土曜日';
      default:
        return '';
    }
  },

  getSpecifiedDayLabel: (specifiedDay?: TaskMonthlyPeriod['specifiedDay']) => {
    switch (specifiedDay) {
      case 0:
        return '月初';
      case 99:
        return '月末';
      default:
        return specifiedDay ? `${specifiedDay}日` : '';
    }
  },
};

export const extractTaskCode = (taskCode: string): { organizationCode: string; taskOrder: number } => {
  const [organizationCode, taskOrder] = taskCode.split(/-(?=\d+$)/);

  return {
    organizationCode,
    taskOrder: +taskOrder,
  };
};
