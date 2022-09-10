import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { usersConstant } from '../constants/userManagement';

const initialState = {
  isLoading: false,
  isSubmitting: false,
  isDeleting: false,
  isResending: false,
  isResetting: false,
  users: [],
  meta: {},
  searchState: {},
};

const reducer = (state = initialState, action: Action) => {
  const { payload } = action;
  const { data, meta } = payload?.response ?? {};

  switch (action.type) {
    case REQUEST(usersConstant.GET_USERS):
      return {
        ...state,
        isLoading: true,
        searchState: payload?.params,
      };
    case SUCCESS(usersConstant.GET_USERS):
      return {
        ...state,
        isLoading: false,
        users: data,
        meta,
      };
    case FAILURE(usersConstant.GET_USERS):
      return {
        ...state,
        isLoading: false,
        users: [],
      };
    case REQUEST(usersConstant.CREATE_USER):
      return {
        ...state,
        isSubmitting: true,
      };
    case SUCCESS(usersConstant.CREATE_USER):
    case FAILURE(usersConstant.CREATE_USER):
      return {
        ...state,
        isSubmitting: false,
      };
    case REQUEST(usersConstant.GET_USER_DETAIL):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(usersConstant.GET_USER_DETAIL):
      return {
        ...state,
        isLoading: false,
        userDetail: data,
      };
    case FAILURE(usersConstant.GET_USER_DETAIL):
      return {
        ...state,
        isLoading: false,
        userDetail: [],
      };

    case REQUEST(usersConstant.UPDATE_USER):
      return {
        ...state,
        isSubmitting: true,
      };
    case SUCCESS(usersConstant.UPDATE_USER):
    case FAILURE(usersConstant.UPDATE_USER):
      return {
        ...state,
        isSubmitting: false,
      };

    case REQUEST(usersConstant.DELETE_USER):
      return {
        ...state,
        isDeleting: true,
      };
    case SUCCESS(usersConstant.DELETE_USER):
    case FAILURE(usersConstant.DELETE_USER):
      return {
        ...state,
        isDeleting: false,
      };
    case REQUEST(usersConstant.RESEND_PASSWORD):
      return {
        ...state,
        isResending: true,
      };
    case SUCCESS(usersConstant.RESEND_PASSWORD):
    case FAILURE(usersConstant.RESEND_PASSWORD):
      return {
        ...state,
        isResending: false,
      };
    case REQUEST(usersConstant.RESET_PASSWORD):
      return {
        ...state,
        isResetting: true,
      };
    case SUCCESS(usersConstant.RESET_PASSWORD):
    case FAILURE(usersConstant.RESET_PASSWORD):
      return {
        ...state,
        isResetting: false,
      };
    default:
      return state;
  }
};
export default reducer;
