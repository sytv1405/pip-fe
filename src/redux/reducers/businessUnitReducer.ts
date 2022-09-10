import { BusinessUnitLevel } from '@/shared/enum';
import { LOADING_STATUSES } from '@/shared/loading';
import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS, CLEAN } from '../constants';
import { businessUnitConstants } from '../constants/businessUnit';

const initialState = {
  isLoading: false,
  isCreateLoading: false,
  isUpdateLoading: false,
  isSearchLoading: false,
  isDeleteLoading: false,
  isUploading: false,
  isSortLoading: false,
  isDownloading: false,
  businessUnitsRelativeLoadingStatus: LOADING_STATUSES.IDLE,
  businessLevel: BusinessUnitLevel.large,
  largeBusinessUnits: [],
  mediumBusinessUnits: [],
  largeBusinessUnitDetails: {},
  mediumBusinessUnitDetails: {},
  smallBusinessUnitDetails: {},
  businessUnitSearch: [],
  businessUnitQueryParam: {} as BusinessUnitMasterFilterForm,
  businessUnitsRelative: [],
};

const reducer = (state = initialState, action: Action): typeof initialState => {
  const { payload } = action;

  switch (action.type) {
    case REQUEST(businessUnitConstants.GET_LARGE_UNITS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitConstants.GET_LARGE_UNITS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitConstants.GET_LARGE_UNITS):
      return {
        ...state,
        isLoading: false,
        largeBusinessUnits: [],
      };
    case REQUEST(businessUnitConstants.GET_MEDIUM_UNITS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitConstants.GET_MEDIUM_UNITS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitConstants.GET_MEDIUM_UNITS):
      return {
        ...state,
        isLoading: false,
        mediumBusinessUnits: [],
      };
    case REQUEST(businessUnitConstants.CREATE_LARGE_UNIT):
    case REQUEST(businessUnitConstants.CREATE_MEDIUM_UNIT):
    case REQUEST(businessUnitConstants.CREATE_SMALL_UNIT):
      return {
        ...state,
        isCreateLoading: true,
      };
    case SUCCESS(businessUnitConstants.CREATE_LARGE_UNIT):
    case SUCCESS(businessUnitConstants.CREATE_MEDIUM_UNIT):
    case SUCCESS(businessUnitConstants.CREATE_SMALL_UNIT):
    case FAILURE(businessUnitConstants.CREATE_LARGE_UNIT):
    case FAILURE(businessUnitConstants.CREATE_MEDIUM_UNIT):
    case FAILURE(businessUnitConstants.CREATE_SMALL_UNIT):
      return {
        ...state,
        isCreateLoading: false,
      };
    case REQUEST(businessUnitConstants.GET_LARGE_UNIT_DETAILS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitConstants.GET_LARGE_UNIT_DETAILS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitConstants.GET_LARGE_UNIT_DETAILS):
    case CLEAN(businessUnitConstants.GET_LARGE_UNIT_DETAILS):
      return {
        ...state,
        isLoading: false,
        largeBusinessUnitDetails: {},
      };
    case REQUEST(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS):
    case CLEAN(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS):
      return {
        ...state,
        isLoading: false,
        mediumBusinessUnitDetails: {},
      };
    case REQUEST(businessUnitConstants.GET_SMALL_UNIT_DETAILS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitConstants.GET_SMALL_UNIT_DETAILS):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitConstants.GET_SMALL_UNIT_DETAILS):
    case CLEAN(businessUnitConstants.GET_SMALL_UNIT_DETAILS):
      return {
        ...state,
        isLoading: false,
        smallBusinessUnitDetails: {},
      };
    case REQUEST(businessUnitConstants.UPDATE_LARGE_UNIT):
    case REQUEST(businessUnitConstants.UPDATE_MEDIUM_UNIT):
    case REQUEST(businessUnitConstants.UPDATE_SMALL_UNIT):
      return {
        ...state,
        isUpdateLoading: true,
      };
    case SUCCESS(businessUnitConstants.UPDATE_LARGE_UNIT):
    case FAILURE(businessUnitConstants.UPDATE_LARGE_UNIT):
    case SUCCESS(businessUnitConstants.UPDATE_MEDIUM_UNIT):
    case FAILURE(businessUnitConstants.UPDATE_MEDIUM_UNIT):
    case SUCCESS(businessUnitConstants.UPDATE_SMALL_UNIT):
    case FAILURE(businessUnitConstants.UPDATE_SMALL_UNIT):
      return {
        ...state,
        isUpdateLoading: false,
      };
    case REQUEST(businessUnitConstants.SEARCH_BUSINESS_UNIT):
      return {
        ...state,
        isSearchLoading: true,
      };
    case SUCCESS(businessUnitConstants.SEARCH_BUSINESS_UNIT):
      return {
        ...state,
        isSearchLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitConstants.SEARCH_BUSINESS_UNIT):
      return {
        ...state,
        isSearchLoading: false,
        businessUnitSearch: [],
      };
    case REQUEST(businessUnitConstants.UPDATE_BUSINESS_LEVEL):
      return {
        ...state,
        ...payload,
      };
    case REQUEST(businessUnitConstants.DELETE_LARGE_UNIT):
    case REQUEST(businessUnitConstants.DELETE_MEDIUM_UNIT):
    case REQUEST(businessUnitConstants.DELETE_SMALL_UNIT):
      return {
        ...state,
        isDeleteLoading: true,
      };
    case SUCCESS(businessUnitConstants.DELETE_LARGE_UNIT):
    case SUCCESS(businessUnitConstants.DELETE_MEDIUM_UNIT):
    case SUCCESS(businessUnitConstants.DELETE_SMALL_UNIT):
    case FAILURE(businessUnitConstants.DELETE_LARGE_UNIT):
    case FAILURE(businessUnitConstants.DELETE_MEDIUM_UNIT):
    case FAILURE(businessUnitConstants.DELETE_SMALL_UNIT):
      return {
        ...state,
        isDeleteLoading: false,
      };
    case REQUEST(businessUnitConstants.SORT_BUSINESS_UNIT):
      return {
        ...state,
        isSortLoading: true,
      };
    case SUCCESS(businessUnitConstants.SORT_BUSINESS_UNIT):
    case FAILURE(businessUnitConstants.SORT_BUSINESS_UNIT):
      return {
        ...state,
        isSortLoading: false,
      };
    case REQUEST(businessUnitConstants.BULK_INSERT_BUSINESS_UNIT):
      return {
        ...state,
        isUploading: true,
      };
    case SUCCESS(businessUnitConstants.BULK_INSERT_BUSINESS_UNIT):
    case FAILURE(businessUnitConstants.BULK_INSERT_BUSINESS_UNIT):
      return {
        ...state,
        isUploading: false,
      };
    case REQUEST(businessUnitConstants.UPDATE_BUSINESS_UNIT_QUERY_PARAM): {
      const {
        params: { businessUnitQueryParam },
      } = payload;
      return {
        ...state,
        businessUnitQueryParam,
      };
    }
    case REQUEST(businessUnitConstants.DOWNLOAD_BUSINESS_UNIT):
      return {
        ...state,
        isDownloading: true,
      };
    case SUCCESS(businessUnitConstants.DOWNLOAD_BUSINESS_UNIT):
    case FAILURE(businessUnitConstants.DOWNLOAD_BUSINESS_UNIT):
      return {
        ...state,
        isDownloading: false,
      };
    case REQUEST(businessUnitConstants.CLEAR_LARGE_UNITS_DATA):
      return {
        ...state,
        largeBusinessUnits: [],
      };
    case REQUEST(businessUnitConstants.CLEAR_MEDIUM_UNITS_DATA):
      return {
        ...state,
        mediumBusinessUnits: [],
      };
    case REQUEST(businessUnitConstants.CLEAR_BUSINESS_UNITS_SEARCH_DATA):
      return {
        ...state,
        businessUnitSearch: [],
      };
    case REQUEST(businessUnitConstants.GET_BUSINESS_UNITS_RELATIVE):
      return {
        ...state,
        businessUnitsRelativeLoadingStatus: LOADING_STATUSES.LOADING,
      };
    case SUCCESS(businessUnitConstants.GET_BUSINESS_UNITS_RELATIVE):
      return {
        ...state,
        businessUnitsRelativeLoadingStatus: LOADING_STATUSES.SUCCESS,
        businessUnitsRelative: payload.response,
      };
    case FAILURE(businessUnitConstants.GET_BUSINESS_UNITS_RELATIVE):
      return {
        ...state,
        businessUnitsRelativeLoadingStatus: LOADING_STATUSES.ERROR,
        businessUnitsRelative: [],
      };
    default:
      return state;
  }
};

export default reducer;
