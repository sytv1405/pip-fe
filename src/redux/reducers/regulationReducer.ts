import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { regulationConstants } from '../constants/regulation';

const initialState = {
  isLoading: false,
  isCreateLoading: false,
  isDeleteLoading: false,
  isBulkInsertLoading: false,
  regulations: [],
  regulation: {},
};

const reducer = (state = initialState, action: Action) => {
  const { payload } = action;

  switch (action.type) {
    case REQUEST(regulationConstants.GET_REGULATIONS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(regulationConstants.GET_REGULATIONS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(regulationConstants.GET_REGULATIONS):
      return {
        ...state,
        isLoading: false,
        regulations: [],
      };
    case REQUEST(regulationConstants.CREATE_REGULATION):
      return {
        ...state,
        isCreateLoading: true,
      };
    case SUCCESS(regulationConstants.CREATE_REGULATION):
    case FAILURE(regulationConstants.CREATE_REGULATION):
      return {
        ...state,
        isCreateLoading: false,
      };
    case REQUEST(regulationConstants.GET_REGULATION):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(regulationConstants.GET_REGULATION):
      return {
        ...state,
        ...payload,
        isLoading: false,
      };
    case FAILURE(regulationConstants.GET_REGULATION):
      return {
        ...state,
        regulation: {},
        isLoading: false,
      };
    case REQUEST(regulationConstants.UPDATE_REGULATION):
      return {
        ...state,
        isUpdateLoading: true,
      };
    case SUCCESS(regulationConstants.UPDATE_REGULATION):
    case FAILURE(regulationConstants.UPDATE_REGULATION):
      return {
        ...state,
        isUpdateLoading: false,
      };
    case REQUEST(regulationConstants.DELETE_REGULATIONS):
      return {
        ...state,
        isDeleteLoading: true,
      };
    case SUCCESS(regulationConstants.DELETE_REGULATIONS):
    case FAILURE(regulationConstants.DELETE_REGULATIONS):
      return {
        ...state,
        isDeleteLoading: false,
      };
    case REQUEST(regulationConstants.BULK_INSERT_REGULATIONS):
      return {
        ...state,
        isBulkInsertLoading: true,
      };
    case SUCCESS(regulationConstants.BULK_INSERT_REGULATIONS):
    case FAILURE(regulationConstants.BULK_INSERT_REGULATIONS):
      return {
        ...state,
        isBulkInsertLoading: false,
      };
    default:
      return state;
  }
};

export default reducer;
