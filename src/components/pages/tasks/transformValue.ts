import { flattenDeep, isNil, pickBy, includes } from 'lodash';
import moment from 'moment';

import { parseBoolean } from '@/utils/convertUtils';

import { inActivateTaskReasons } from './constants';

export const normalizeSearchParams = params => {
  const {
    deadline,
    actual,
    departmentIds = [],
    reasons = [],
    timeFrom,
    timeTo,
    keyword,
    periodTypes = [],
    specified = [],
    ...rest
  } = params ?? {};

  const { duplicate, registrationError, systemChange } = inActivateTaskReasons;

  const isDisablePeriodType = parseBoolean(actual) && !parseBoolean(deadline);
  const periodTypesList = !isDisablePeriodType ? periodTypes.concat(specified) : [];
  const reasonsList = includes(reasons, 'all') ? [duplicate, registrationError, systemChange] : flattenDeep([reasons ?? []]);

  const queryParams = {
    ...rest,
    departmentIds: flattenDeep(departmentIds ?? []),
    periodTypes: flattenDeep([periodTypesList ?? []]),
    reasons: reasonsList,
    deadline: parseBoolean(deadline),
    actual: parseBoolean(actual),
    timeFrom: timeFrom ? moment(timeFrom)?.toISOString() : undefined,
    timeTo: timeTo ? moment(timeTo)?.toISOString() : undefined,
    keyword: keyword ?? '',
  };

  return pickBy(queryParams, value => !isNil(value));
};

export const mappingFormValues = query => {
  const { timeFrom, timeTo, departmentIds = [], deadline, actual, reasons = [], keyword, ...rest } = query || {};
  const departments = flattenDeep([departmentIds || []]);

  return {
    ...rest,
    deadline: parseBoolean(deadline),
    actual: parseBoolean(actual),
    timeFrom: timeFrom ? moment(timeFrom) : undefined,
    timeTo: timeTo ? moment(timeTo) : undefined,
    departmentIds: departments,
    reasons: flattenDeep([reasons || []]),
    keyword: keyword || '',
  };
};
