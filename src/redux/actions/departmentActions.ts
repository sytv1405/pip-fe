import { Payload } from '@/types';

import { REQUEST, departmentConstants } from '../constants';

export const getDepartments = () => ({
  type: REQUEST(departmentConstants.GET_DEPARTMENTS),
});

export const searchDepartments = (payload: Payload) => ({
  type: REQUEST(departmentConstants.SEARCH_DEPARTMENTS),
  payload,
});

export const getDepartmentsForSearchUnit = () => ({
  type: REQUEST(departmentConstants.GET_DEPARTMENTS_FOR_BUSINESS_UNIT),
});

export const createDepartment = (payload: Payload) => ({
  type: REQUEST(departmentConstants.CREATE_DEPARTMENT),
  payload,
});

export const deleteDepartment = (payload: Payload) => ({
  type: REQUEST(departmentConstants.DELETE_DEPARTMENT),
  payload,
});

export const getDepartmentDetail = (payload: Payload) => ({
  type: REQUEST(departmentConstants.GET_DEPARTMENT_DETAIL),
  payload,
});

export const updateDepartment = (payload: Payload) => ({
  type: REQUEST(departmentConstants.UPDATE_DEPARTMENT),
  payload,
});

export const bulkUpdateDepartments = (payload: Payload) => ({
  type: REQUEST(departmentConstants.BULK_UPDATE_DEPARTMENTS),
  payload,
});

export const bulkInsertDepartments = (payload: Payload) => ({
  type: REQUEST(departmentConstants.BULK_INSERT_DEPARTMENTS),
  payload,
});

export const getDepartmentsForEditUser = (payload: Payload) => ({
  type: REQUEST(departmentConstants.GET_DEPARTMENTS_FOR_EDIT_USER),
  payload,
});

export const clearDepartments = () => ({
  type: departmentConstants.CLEAR_DEPARTMENTS,
});
