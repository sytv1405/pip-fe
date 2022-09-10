import { Payload } from '@/types';

import { REQUEST, CLEAN, businessUnitConstants } from '../constants';

export const getLargeBusinessUnits = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.GET_LARGE_UNITS),
  payload,
});

export const getMediumBusinessUnits = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.GET_MEDIUM_UNITS),
  payload,
});

export const createLargeBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.CREATE_LARGE_UNIT),
  payload,
});

export const createMediumBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.CREATE_MEDIUM_UNIT),
  payload,
});

export const createSmallBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.CREATE_SMALL_UNIT),
  payload,
});

export const getLargeBusinessUnitDetails = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.GET_LARGE_UNIT_DETAILS),
  payload,
});
export const cleanLargeBusinessUnitDetails = () => ({
  type: CLEAN(businessUnitConstants.GET_LARGE_UNIT_DETAILS),
});

export const getMediumBusinessUnitDetails = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS),
  payload,
});
export const cleanMediumBusinessUnitDetails = () => ({
  type: CLEAN(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS),
});

export const getSmallBusinessUnitDetails = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.GET_SMALL_UNIT_DETAILS),
  payload,
});

export const cleanSmallBusinessUnitDetails = () => ({
  type: CLEAN(businessUnitConstants.GET_SMALL_UNIT_DETAILS),
});

export const updateLargeBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.UPDATE_LARGE_UNIT),
  payload,
});

export const updateMediumBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.UPDATE_MEDIUM_UNIT),
  payload,
});

export const updateSmallBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.UPDATE_SMALL_UNIT),
  payload,
});

export const searchBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.SEARCH_BUSINESS_UNIT),
  payload,
});

export const updateBusinessLevel = (payload: BusinessLevelPayload) => ({
  type: REQUEST(businessUnitConstants.UPDATE_BUSINESS_LEVEL),
  payload,
});

export const deleteLargeBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.DELETE_LARGE_UNIT),
  payload,
});

export const deleteMediumBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.DELETE_MEDIUM_UNIT),
  payload,
});

export const deleteSmallBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.DELETE_SMALL_UNIT),
  payload,
});

export const sortBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.SORT_BUSINESS_UNIT),
  payload,
});

export const bulkInsertBusinessUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.BULK_INSERT_BUSINESS_UNIT),
  payload,
});

export const updateBusinessUnitQueryParam = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.UPDATE_BUSINESS_UNIT_QUERY_PARAM),
  payload,
});

export const downloadBusinesUnit = (payload: Payload) => ({
  type: REQUEST(businessUnitConstants.DOWNLOAD_BUSINESS_UNIT),
  payload,
});

export const clearLargeBusinessUnits = () => ({
  type: REQUEST(businessUnitConstants.CLEAR_LARGE_UNITS_DATA),
});

export const clearMediumBusinessUnits = () => ({
  type: REQUEST(businessUnitConstants.CLEAR_MEDIUM_UNITS_DATA),
});

export const clearBusinessUnitsSearch = () => ({
  type: REQUEST(businessUnitConstants.CLEAR_BUSINESS_UNITS_SEARCH_DATA),
});

export const getBusinessUnitsRelative = () => ({
  type: REQUEST(businessUnitConstants.GET_BUSINESS_UNITS_RELATIVE),
});
