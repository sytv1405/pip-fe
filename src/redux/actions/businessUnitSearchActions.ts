import { businessUnitSearchConstants } from '@/redux/constants/businessUnitSearch';
import { Payload } from '@/types';

import { REQUEST, CLEAN } from '../constants';

export const getLargeBusinessUnitsForSearch = (payload: Payload) => ({
  type: REQUEST(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH),
  payload,
});

export const cleanLargeBusinessUnitsForSearch = () => ({
  type: CLEAN(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH),
});

export const getMediumBusinessUnitsForSearch = (payload: Payload) => ({
  type: REQUEST(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH),
  payload,
});

export const cleanMediumBusinessUnitsForSearch = () => ({
  type: CLEAN(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH),
});

export const getSmallBusinessUnitsForSearch = (payload: Payload) => ({
  type: REQUEST(businessUnitSearchConstants.GET_SMALL_UNITS_FOR_SEARCH),
  payload,
});

export const getAllBusinessUnitsForSearch = (payload: Payload) => ({
  type: REQUEST(businessUnitSearchConstants.GET_ALL_BUSINESS_FOR_SEARCH),
  payload,
});

export const cleanSmallBusinessUnitsForSearch = () => ({
  type: CLEAN(businessUnitSearchConstants.GET_SMALL_UNITS_FOR_SEARCH),
});

export const saveBusinessSearchState = (payload: Payload) => ({
  type: REQUEST(businessUnitSearchConstants.SAVE_BUSINESS_SEARCH_PARAMS),
  payload,
});
