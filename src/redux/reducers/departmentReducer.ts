import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { departmentConstants } from '../constants/department';

const initialState = {
  isLoading: false,
  isCreateLoading: false,
  isDeleteLoading: false,
  isBulkInsertLoading: false,
  type: '',
  departments: [],
  departmentsForSearchUnit: [],
  departmentDetail: {},
  departmentsForEditUser: [],
};

const reducer = (state = initialState, action: Action) => {
  const { payload } = action;
  const { data } = payload?.response || {};

  switch (action.type) {
    case REQUEST(departmentConstants.GET_DEPARTMENTS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(departmentConstants.GET_DEPARTMENTS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(departmentConstants.GET_DEPARTMENTS):
      return {
        ...state,
        isLoading: false,
        departments: [],
      };
    case REQUEST(departmentConstants.SEARCH_DEPARTMENTS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(departmentConstants.SEARCH_DEPARTMENTS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(departmentConstants.SEARCH_DEPARTMENTS):
      return {
        ...state,
        isLoading: false,
        departments: [],
      };
    case REQUEST(departmentConstants.GET_DEPARTMENTS_FOR_BUSINESS_UNIT):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(departmentConstants.GET_DEPARTMENTS_FOR_BUSINESS_UNIT):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(departmentConstants.GET_DEPARTMENTS_FOR_BUSINESS_UNIT):
      return {
        ...state,
        isLoading: false,
        departmentsForSearchUnit: [],
      };
    case REQUEST(departmentConstants.GET_DEPARTMENT_DETAIL):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(departmentConstants.GET_DEPARTMENT_DETAIL):
      return {
        ...state,
        isLoading: false,
        departmentDetail: data,
      };
    case FAILURE(departmentConstants.GET_DEPARTMENT_DETAIL):
      return {
        ...state,
        isLoading: false,
        departmentDetail: {},
      };

    case REQUEST(departmentConstants.CREATE_DEPARTMENT):
      return {
        ...state,
        isCreateLoading: true,
      };
    case SUCCESS(departmentConstants.CREATE_DEPARTMENT):
      return {
        ...state,
        isCreateLoading: false,
      };
    case FAILURE(departmentConstants.CREATE_DEPARTMENT):
      return {
        ...state,
        isCreateLoading: false,
      };
    case REQUEST(departmentConstants.DELETE_DEPARTMENT):
      return {
        ...state,
        isDeleteLoading: true,
      };
    case SUCCESS(departmentConstants.DELETE_DEPARTMENT):
      return {
        ...state,
        isDeleteLoading: false,
      };
    case FAILURE(departmentConstants.DELETE_DEPARTMENT):
      return {
        ...state,
        isDeleteLoading: false,
      };

    case REQUEST(departmentConstants.UPDATE_DEPARTMENT):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(departmentConstants.UPDATE_DEPARTMENT):
    case FAILURE(departmentConstants.UPDATE_DEPARTMENT):
      return {
        ...state,
        isLoading: false,
      };
    case REQUEST(departmentConstants.BULK_UPDATE_DEPARTMENTS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(departmentConstants.BULK_UPDATE_DEPARTMENTS):
    case FAILURE(departmentConstants.BULK_UPDATE_DEPARTMENTS):
      return {
        ...state,
        isLoading: false,
      };
    case REQUEST(departmentConstants.BULK_INSERT_DEPARTMENTS):
      return {
        ...state,
        isBulkInsertLoading: true,
      };
    case SUCCESS(departmentConstants.BULK_INSERT_DEPARTMENTS):
    case FAILURE(departmentConstants.BULK_INSERT_DEPARTMENTS):
      return {
        ...state,
        isBulkInsertLoading: false,
      };
    case REQUEST(departmentConstants.GET_DEPARTMENTS_FOR_EDIT_USER):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(departmentConstants.GET_DEPARTMENTS_FOR_EDIT_USER):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(departmentConstants.GET_DEPARTMENTS_FOR_EDIT_USER):
      return {
        ...state,
        isLoading: false,
        departmentsForEditUser: [],
      };
    case departmentConstants.CLEAR_DEPARTMENTS:
      return {
        ...state,
        departments: [],
      };
    default:
      return state;
  }
};

export default reducer;
