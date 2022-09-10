import { REQUEST, authConstants } from '../constants';

export const getUser = () => ({
  type: REQUEST(authConstants.GET_USER),
});

export const clearUser = () => ({
  type: authConstants.CLEAR_USER,
});
