import moment, { MomentInput } from 'moment';

import { DATE_TIME_FORMAT_DEFAULT } from '@/shared/constants';

export const formatDateTime = (data?: MomentInput, format: string = DATE_TIME_FORMAT_DEFAULT): string => {
  return moment(data).format(format);
};

// https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript#answer-67130235
export const excelSerialDateToJSDate = (excelSerialDate: number): Date => {
  return new Date(Date.UTC(0, 0, excelSerialDate - 1));
};
