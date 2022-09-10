import moment from 'moment';
import { isNil, invert, range, isString } from 'lodash';
import { TFunction } from 'next-i18next';

import { Task, Transaction } from '@/types';
import { formatDateTime } from '@/utils/dateTimeUtils';
import { ANNUALLY_DAY_CODE_SPECIAL, MONTHLY_DAY_CODE_SPECIAL, taskPeriodTypes, weekDays } from '@/components/pages/tasks/constants';
import { convertToDateJP as convertToDateJPUtil } from '@/utils/dateJp';

import { JapaneseDaysInWeek } from './enum';
import { DATE_FORMAT_JP, shortDayMonthJPFormat } from './constants';

export const convertToDateJP = (datetime, type = 'text') => {
  if (!datetime) return '';
  const parts = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'short' }).formatToParts(new Date(datetime));
  const era = parts.find(item => item.type === 'era').value;
  const month = +parts.find(item => item.type === 'month').value;
  const day = +parts.find(item => item.type === 'day').value;
  const year = +parts.find(item => item.type === 'year').value;

  switch (type) {
    case 'dateOnly':
      return `${era}${year}年${month}月${day}日`;
    case 'dateTime':
      return `${era}${year}年${month}月${day}日${moment(datetime).format(' HH:mm')}`;
    case 'reiwa':
      return `${era}${month < 4 ? year - 1 : year}`;
    case 'yearMonth':
      return `${era}${year}年${month}月`;
    default:
      return `${era}${year}年${month}月`;
  }
};

export const weekDaysInMonth = (
  year: number,
  monthInYear: number,
  weekCode: number,
  additionInfor: { addition: number; additionType: string }
): { startDate: moment.Moment; endDate: moment.Moment }[] => {
  const weekDate = moment([year, monthInYear]).isoWeekday(weekCode === 0 ? 7 : weekCode);

  if (weekDate.date() > 7) {
    weekDate.add(7, 'd');
  }

  const endOfMonth = moment().set('month', monthInYear).endOf('month');
  const weekDaysInMonthResult = [];

  while (endOfMonth.diff(weekDate, 'day') >= -7) {
    weekDaysInMonthResult.push({
      startDate: weekDate
        .clone()
        .add(1, 'day')
        .subtract(additionInfor.addition, additionInfor.additionType as any),
      endDate: weekDate.clone().add(1, 'day'),
    });
    weekDate.add(7, 'd');
  }

  return weekDaysInMonthResult;
};

export const checkRangeDateOverlap = (
  range1: { startDate: moment.Moment; endDate: moment.Moment },
  range2: { startDate: moment.Moment; endDate: moment.Moment }
) => {
  const { startDate: startDate1, endDate: endDate1 } = range1;
  const { startDate: startDate2, endDate: endDate2 } = range2;

  return startDate1.isBetween(startDate2, endDate2) || startDate2.isBetween(startDate1, endDate1);
};

export const getTaskPeriod = (task: Task, t: TFunction, transaction?: Transaction, isConvertToDateJP?: boolean) => {
  const { periodType, taskMonthlyPeriods, taskWeeklyPeriods, taskAnnuallyPeriods, taskSpecifiedPeriods } = task || {};
  if (transaction) {
    if (transaction.completionDate) {
      return isConvertToDateJP
        ? convertToDateJPUtil(transaction.completionDate)
        : formatDateTime(transaction.completionDate, DATE_FORMAT_JP);
    }

    return '';
  }

  switch (periodType) {
    case taskPeriodTypes.weekly: {
      const { weekCode } = taskWeeklyPeriods?.[0] || {};
      const weekDay = invert(weekDays)[weekCode];
      return isNil(weekCode) ? '' : t('common:every_weekday_of_week', { weekDay: t(`common:${weekDay}`) });
    }
    case taskPeriodTypes.monthly: {
      const { specifiedDay } = taskMonthlyPeriods?.[0] || {};
      if (isNil(specifiedDay)) return '';
      if (MONTHLY_DAY_CODE_SPECIAL[specifiedDay]) return t(`common:${MONTHLY_DAY_CODE_SPECIAL[specifiedDay]}`);

      return t('common:every_day_of_month', { day: specifiedDay });
    }
    case taskPeriodTypes.monthlyNo: {
      const { specifiedNo, weekCode } = taskMonthlyPeriods?.[0] || {};
      if (isNil(specifiedNo) || isNil(weekCode)) return '';
      if (MONTHLY_DAY_CODE_SPECIAL[specifiedNo]) return t(`common:${MONTHLY_DAY_CODE_SPECIAL[specifiedNo]}`);

      return t('common:monthy_specified', { times: specifiedNo, weekDay: JapaneseDaysInWeek[weekCode] });
    }
    case taskPeriodTypes.annually: {
      const { specifiedMonth, specifiedDay } = taskAnnuallyPeriods?.[0] || {};
      if (isNil(specifiedDay) || isNil(specifiedMonth)) return '';
      if (ANNUALLY_DAY_CODE_SPECIAL[specifiedDay]) return t(`common:${ANNUALLY_DAY_CODE_SPECIAL[specifiedDay]}`, { month: specifiedMonth });

      return t('common:every_month_day_of_year', { month: specifiedMonth, day: specifiedDay });
    }
    case taskPeriodTypes.annuallyNo: {
      const { specifiedMonth, specifiedNo, weekCode } = taskAnnuallyPeriods?.[0] || {};
      if (isNil(specifiedMonth) || isNil(specifiedNo) || isNil(weekCode)) return '';
      if (ANNUALLY_DAY_CODE_SPECIAL[specifiedNo]) return t(`common:${ANNUALLY_DAY_CODE_SPECIAL[specifiedNo]}`, { month: specifiedMonth });

      return t('common:annually_specified', { month: specifiedMonth, times: specifiedNo, weekDay: JapaneseDaysInWeek[weekCode] });
    }
    case taskPeriodTypes.specified:
      return isConvertToDateJP
        ? convertToDateJPUtil(taskSpecifiedPeriods?.[0]?.specifiedOn)
        : formatDateTime(taskSpecifiedPeriods?.[0]?.specifiedOn, DATE_FORMAT_JP);
    default:
      return '';
  }
};

export const getShortTaskPeriod = (task: Task, t: TFunction, month?: string) => {
  const { periodType, taskMonthlyPeriods, taskWeeklyPeriods, taskAnnuallyPeriods, taskSpecifiedPeriods } = task || {};
  switch (periodType) {
    case taskPeriodTypes.weekly: {
      const { weekCode } = taskWeeklyPeriods?.[0] || {};
      if (isNil(weekCode)) return 'empty';

      const weekDay = Object.keys(weekDays).find(day => weekDays[day] === weekCode);

      return t(`common:${weekDay}`);
    }
    case taskPeriodTypes.monthly: {
      const { specifiedDay } = taskMonthlyPeriods?.[0] || {};
      if (isNil(specifiedDay)) return 'empty';

      if (MONTHLY_DAY_CODE_SPECIAL[specifiedDay]) return t(`common:${MONTHLY_DAY_CODE_SPECIAL[specifiedDay]}`);

      return month ? t('common:month_day', { month, day: specifiedDay }) : t('common:every_day_of_month', { day: specifiedDay });
    }
    case taskPeriodTypes.monthlyNo: {
      const { specifiedNo, weekCode } = taskMonthlyPeriods?.[0] || {};
      if (isNil(specifiedNo) || isNil(weekCode)) return 'empty';

      if (MONTHLY_DAY_CODE_SPECIAL[specifiedNo]) return t(`common:${MONTHLY_DAY_CODE_SPECIAL[specifiedNo]}`);

      return t('common:short_monthy_specified', { times: specifiedNo, weekDay: JapaneseDaysInWeek[weekCode] });
    }
    case taskPeriodTypes.annually: {
      const { specifiedMonth, specifiedDay } = taskAnnuallyPeriods?.[0] || {};
      if (isNil(specifiedDay) || isNil(specifiedMonth)) return 'empty';
      if (MONTHLY_DAY_CODE_SPECIAL[specifiedDay]) return t(`common:${MONTHLY_DAY_CODE_SPECIAL[specifiedDay]}`);

      return t('common:month_day', { month: specifiedMonth, day: specifiedDay });
    }
    case taskPeriodTypes.annuallyNo: {
      const { specifiedMonth, specifiedNo, weekCode } = taskAnnuallyPeriods?.[0] || {};
      if (isNil(specifiedMonth) || isNil(specifiedNo) || isNil(weekCode)) return 'empty';
      if (MONTHLY_DAY_CODE_SPECIAL[specifiedNo]) return t(`common:${MONTHLY_DAY_CODE_SPECIAL[specifiedNo]}`);

      return t('common:short_monthy_specified', { times: specifiedNo, weekDay: JapaneseDaysInWeek[weekCode] });
    }
    case taskPeriodTypes.specified: {
      const { specifiedOn } = taskSpecifiedPeriods?.[0] || {};

      return specifiedOn ? formatDateTime(specifiedOn, shortDayMonthJPFormat) : 'empty';
    }
    default:
      return 'empty';
  }
};

export const getSortedGroup = (t: TFunction, month?: string) => {
  const sortedDay = range(1, 32).map(day => (month ? t('common:month_day', { month, day }) : t('common:every_day_of_month', { day })));
  const sortedWeek = Object.keys(weekDays).map(weekDay => t(`common:${weekDay}`));
  const sortedSpecialCode = [
    t('common:begin_of_every_month'),
    t('common:start_month'),
    t('common:middle_month'),
    t('common:end_month'),
    t('common:end_of_every_month'),
  ];
  const sortedMonthySpecified = [];
  range(1, 5).forEach(times => {
    Object.values(JapaneseDaysInWeek)
      .filter(isString)
      .forEach(weekDay => {
        sortedMonthySpecified.push(t('common:short_monthy_specified', { times, weekDay }));
      });
  });

  return {
    sortedAll: [...sortedDay, ...sortedWeek, ...sortedMonthySpecified, ...sortedSpecialCode],
    sortedMonth: [...sortedDay, ...sortedMonthySpecified, ...sortedSpecialCode],
    sortedDay,
    sortedWeek,
    sortedMonthySpecified,
    sortedSpecialCode,
  };
};
