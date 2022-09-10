import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { regulationTypeConstants } from '../constants/regulationType';

const initialState = {
  isLoading: false,
  regulationTypes: [],
  isCreateLoading: false,
  isDeleting: false,
};

const reducer = (state = initialState, action: Action) => {
  const { payload } = action;

  switch (action.type) {
    case REQUEST(regulationTypeConstants.GET_REGULATION_TYPES):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(regulationTypeConstants.GET_REGULATION_TYPES):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(regulationTypeConstants.GET_REGULATION_TYPES):
      return {
        ...state,
        isLoading: false,
        regulationTypes: [],
      };
    case REQUEST(regulationTypeConstants.CREATE_REGULATION_TYPES):
      return {
        ...state,
        isCreateLoading: true,
      };
    case SUCCESS(regulationTypeConstants.CREATE_REGULATION_TYPES):
    case FAILURE(regulationTypeConstants.CREATE_REGULATION_TYPES):
      return {
        ...state,
        isCreateLoading: false,
      };
    case REQUEST(regulationTypeConstants.DELETE_REGULATION_TYPES):
      return {
        ...state,
        isDeleting: true,
      };
    case SUCCESS(regulationTypeConstants.DELETE_REGULATION_TYPES):
    case FAILURE(regulationTypeConstants.DELETE_REGULATION_TYPES):
      return {
        ...state,
        isDeleting: false,
      };

    default:
      return state;
  }
};

export default reducer;
