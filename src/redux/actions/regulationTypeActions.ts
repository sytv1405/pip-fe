import { Payload } from '@/types';

import { REQUEST, regulationTypeConstants } from '../constants';

export const getRegulationTypes = () => ({
  type: REQUEST(regulationTypeConstants.GET_REGULATION_TYPES),
});

export const createRegulationType = (payload: Payload) => ({
  type: REQUEST(regulationTypeConstants.CREATE_REGULATION_TYPES),
  payload,
});

export const deleteRegulationType = (payload: Payload) => ({
  type: REQUEST(regulationTypeConstants.DELETE_REGULATION_TYPES),
  payload,
});
