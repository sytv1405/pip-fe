import { Action } from '@/types';
import { businessUnitSearchConstants } from '@/redux/constants/businessUnitSearch';
import { FAILURE, REQUEST, SUCCESS, CLEAN } from '@/redux/constants';

const initialState = {
  isLoading: false,
  largeBusinessUnitsForSearch: [],
  mediumBusinessUnitsForSearch: [],
  smallBusinessUnitsForSearch: [],
  searchState: {
    searchParams: {},
    treeData: [],
    expandedRowKeys: [],
    departmentName: '',
  },
};

const reducer = (state: typeof initialState = initialState, action: Action): typeof initialState => {
  const { payload } = action;

  switch (action.type) {
    case REQUEST(businessUnitSearchConstants.GET_ALL_BUSINESS_FOR_SEARCH):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitSearchConstants.GET_ALL_BUSINESS_FOR_SEARCH):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitSearchConstants.GET_ALL_BUSINESS_FOR_SEARCH):
      return {
        ...state,
        isLoading: false,
        largeBusinessUnitsForSearch: [],
        mediumBusinessUnitsForSearch: [],
        smallBusinessUnitsForSearch: [],
      };
    case REQUEST(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: false,
        largeBusinessUnitsForSearch: [],
      };
    case CLEAN(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH):
      return {
        ...state,
        largeBusinessUnitsForSearch: [],
      };
    case REQUEST(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: false,
        mediumBusinessUnitsForSearch: [],
      };
    case CLEAN(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH):
      return {
        ...state,
        mediumBusinessUnitsForSearch: [],
      };

    case REQUEST(businessUnitSearchConstants.GET_SMALL_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(businessUnitSearchConstants.GET_SMALL_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(businessUnitSearchConstants.GET_SMALL_UNITS_FOR_SEARCH):
      return {
        ...state,
        isLoading: false,
        smallBusinessUnitsForSearch: [],
      };
    case CLEAN(businessUnitSearchConstants.GET_SMALL_UNITS_FOR_SEARCH):
      return {
        ...state,
        smallBusinessUnitsForSearch: [],
      };
    case REQUEST(businessUnitSearchConstants.SAVE_BUSINESS_SEARCH_PARAMS):
      return {
        ...state,
        searchState: {
          ...state.searchState,
          ...payload?.params,
        },
      };
    default:
      return state;
  }
};

export default reducer;
