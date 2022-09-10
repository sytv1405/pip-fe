import { Payload } from '@/types';

import { REQUEST, usersConstant } from '../constants';

export const getUsers = (payload: Payload) => ({
  type: REQUEST(usersConstant.GET_USERS),
  payload,
});

export const createUser = (payload: Payload) => ({
  type: REQUEST(usersConstant.CREATE_USER),
  payload,
});

export const getUserDetail = (payload: Payload) => ({
  type: REQUEST(usersConstant.GET_USER_DETAIL),
  payload,
});

export const updateUser = (payload: Payload) => ({
  type: REQUEST(usersConstant.UPDATE_USER),
  payload,
});

export const deleteUser = (payload: Payload) => ({
  type: REQUEST(usersConstant.DELETE_USER),
  payload,
});

export const resendPassword = (payload: Payload) => ({
  type: REQUEST(usersConstant.RESEND_PASSWORD),
  payload,
});

export const resetPassword = (payload: Payload) => ({
  type: REQUEST(usersConstant.RESET_PASSWORD),
  payload,
});
