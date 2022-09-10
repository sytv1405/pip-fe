import { Payload } from '@/types';

import { REQUEST, regulationConstants } from '../constants';

export const getRegulations = (payload: Payload) => ({
  type: REQUEST(regulationConstants.GET_REGULATIONS),
  payload,
});

export const createRegulation = (payload: Payload) => ({
  type: REQUEST(regulationConstants.CREATE_REGULATION),
  payload,
});

export const getRegulation = (payload: Payload) => ({
  type: REQUEST(regulationConstants.GET_REGULATION),
  payload,
});

export const updateRegulation = (payload: Payload) => ({
  type: REQUEST(regulationConstants.UPDATE_REGULATION),
  payload,
});

export const deleteRegulations = (payload: Payload) => ({
  type: REQUEST(regulationConstants.DELETE_REGULATIONS),
  payload,
});

export const bulkInsertRegulations = (payload: Payload) => ({
  type: REQUEST(regulationConstants.BULK_INSERT_REGULATIONS),
  payload,
});
