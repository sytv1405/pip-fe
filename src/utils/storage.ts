import { MODES } from '@/shared/mode';
import {
  BUSINESS_UNIT_FILTER_STATE,
  HOME_FILTER_PARAMS,
  MODE,
  TASK_BY_BUSINESS_UNIT_FILTER_STATE,
  TASK_FILTER_PARAMS,
  BUSINESS_UNIT_MONTH_FILTER_STATE,
  BUSINESS_UNIT_YEAR_FILTER_STATE,
  MONTHLY_TASK_FILTER_STATE,
} from '@/shared/storage';

export const setMode = (mode: string) => {
  localStorage.setItem(MODE, mode);
};

export const getMode = (): string => {
  return localStorage.getItem(MODE) || MODES.BASIC;
};

const saveDataToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getDataFromStorage = (key: string) => {
  const storedData = localStorage.getItem(key);

  if (storedData) return JSON.parse(storedData);

  return {};
};

export const setHomeFilterParams = (state: Record<string, any>) => {
  saveDataToStorage(HOME_FILTER_PARAMS, state);
};

export const getHomeFilterParams = (): Record<string, any> => {
  return getDataFromStorage(HOME_FILTER_PARAMS);
};

export const setTaskFilterParams = (state: Record<string, any>) => {
  saveDataToStorage(TASK_FILTER_PARAMS, state);
};

export const getTaskFilterParams = (): Record<string, any> => {
  return getDataFromStorage(TASK_FILTER_PARAMS);
};

export const setBusinessUnitFilterState = (state: Record<string, any>) => {
  saveDataToStorage(BUSINESS_UNIT_FILTER_STATE, state);
};

export const getBusinessUnitFilterState = (): Record<string, any> => {
  return getDataFromStorage(BUSINESS_UNIT_FILTER_STATE);
};

export const setTaskByBusinessUnitFilterState = (state: Record<string, any>) => {
  saveDataToStorage(TASK_BY_BUSINESS_UNIT_FILTER_STATE, state);
};

export const getTaskByBusinessUnitFilterState = (): Record<string, any> => {
  return getDataFromStorage(TASK_BY_BUSINESS_UNIT_FILTER_STATE);
};

export const setMonthlyTaskFilterState = (state: Record<string, any>) => {
  saveDataToStorage(MONTHLY_TASK_FILTER_STATE, state);
};

export const getMonthlyTaskFilterState = (): Record<string, any> => {
  return getDataFromStorage(MONTHLY_TASK_FILTER_STATE);
};

export const setBusinessUnitMonthFilterState = (state: Record<string, any>) => {
  saveDataToStorage(BUSINESS_UNIT_MONTH_FILTER_STATE, state);
};

export const getBusinessUnitMonthFilterState = (): Record<string, any> => {
  return getDataFromStorage(BUSINESS_UNIT_MONTH_FILTER_STATE);
};

export const setBusinessUnitYearFilterState = (state: Record<string, any>) => {
  saveDataToStorage(BUSINESS_UNIT_YEAR_FILTER_STATE, state);
};

export const getBusinessUnitYearFilterState = (): Record<string, any> => {
  return getDataFromStorage(BUSINESS_UNIT_YEAR_FILTER_STATE);
};
