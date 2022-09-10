import moment, { MomentInput } from 'moment';

export const numberSorter = (num1: number, num2: number) => num1 - num2;

export const stringSorter = (string1: string, string2: string) => string1?.localeCompare(string2);

export const dateTimeSorter = (date1: MomentInput, date2: MomentInput) => moment(date1).diff(date2);
