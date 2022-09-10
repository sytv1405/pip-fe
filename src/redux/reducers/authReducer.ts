import { Action } from '@/types';

import { authConstants } from '../constants/auth';
import { FAILURE, REQUEST, SUCCESS } from '../constants';

const initialState = {
  isLoading: false,
  user: {},
};

const reducer = (state = initialState, action: Action) => {
  const { payload } = action;
  switch (action.type) {
    case REQUEST(authConstants.GET_USER):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(authConstants.GET_USER):
      return {
        ...state,
        isLoading: false,
        user: payload?.response,
      };
    case FAILURE(authConstants.GET_USER):
      return {
        ...state,
        isLoading: false,
        user: {},
      };
    case authConstants.CLEAR_USER:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
