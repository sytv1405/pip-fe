import { Payload } from '@/types';

import { REQUEST, organizationConstants } from '../constants';

export const getOrganizations = (payload?: Payload) => ({
  type: REQUEST(organizationConstants.GET_ORGANIZATIONS),
  payload,
});

export const createOrganization = (payload: Payload) => ({
  type: REQUEST(organizationConstants.CREATE_ORGANIZATION),
  payload,
});

export const getOrganization = (payload: Payload) => ({
  type: REQUEST(organizationConstants.GET_ORGANIZATION),
  payload,
});

export const updateOrganization = (payload: Payload) => ({
  type: REQUEST(organizationConstants.UPDATE_ORGANIZATION),
  payload,
});

export const deleteOrganization = (payload: Payload) => ({
  type: REQUEST(organizationConstants.DELETE_ORGANIZATION),
  payload,
});
