import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { organizationConstants } from '../constants/organization';

const initialState = {
  isLoading: false,
  isCreateLoading: false,
  organizations: [],
  organization: {},
  isUpdateLoading: false,
  isDeleteLoading: false,
};

const reducer = (state = initialState, action: Action) => {
  const { payload } = action;

  switch (action.type) {
    case REQUEST(organizationConstants.GET_ORGANIZATIONS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(organizationConstants.GET_ORGANIZATIONS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(organizationConstants.GET_ORGANIZATIONS):
      return {
        ...state,
        isLoading: false,
        organizations: [],
      };
    case REQUEST(organizationConstants.GET_ORGANIZATION):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(organizationConstants.GET_ORGANIZATION):
      return {
        ...state,
        ...payload,
        isLoading: false,
      };
    case FAILURE(organizationConstants.GET_ORGANIZATION):
      return {
        ...state,
        isLoading: false,
        organization: {},
      };
    case REQUEST(organizationConstants.CREATE_ORGANIZATION):
      return {
        ...state,
        isCreateLoading: true,
      };
    case SUCCESS(organizationConstants.CREATE_ORGANIZATION):
    case FAILURE(organizationConstants.CREATE_ORGANIZATION):
      return {
        ...state,
        isCreateLoading: false,
      };
    case REQUEST(organizationConstants.UPDATE_ORGANIZATION):
      return {
        ...state,
        isUpdateLoading: true,
      };
    case SUCCESS(organizationConstants.UPDATE_ORGANIZATION):
    case FAILURE(organizationConstants.UPDATE_ORGANIZATION):
      return {
        ...state,
        isUpdateLoading: false,
      };
    case REQUEST(organizationConstants.DELETE_ORGANIZATION):
      return {
        ...state,
        isDeleteLoading: true,
      };
    case SUCCESS(organizationConstants.DELETE_ORGANIZATION):
    case FAILURE(organizationConstants.DELETE_ORGANIZATION):
      return {
        ...state,
        isDeleteLoading: false,
      };
    default:
      return state;
  }
};

export default reducer;
