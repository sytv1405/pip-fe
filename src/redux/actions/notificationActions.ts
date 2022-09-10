import { Payload } from '@/types';

import { notificationConstants, REQUEST } from '../constants';

export const setMenuMobile = (payload?: Payload) => ({
  type: REQUEST(notificationConstants.SET_MENU_MOBILE),
  payload,
});

export const getNotifications = (payload?: Payload) => ({
  type: REQUEST(notificationConstants.GET_NOTIFICATIONS),
  payload,
});

export const readNotifications = (payload?: Payload) => ({
  type: REQUEST(notificationConstants.READ_NOTIFICATION),
  payload,
});
