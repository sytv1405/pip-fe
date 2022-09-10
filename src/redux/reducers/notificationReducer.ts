import { PAGINATE_NOTIFICATIONS } from '@/shared/constants';
import { LOADING_STATUSES } from '@/shared/loading';
import { Action } from '@/types';

import { FAILURE, notificationConstants, REQUEST, SUCCESS } from '../constants';

const initialState = {
  notificationLoadingStatus: LOADING_STATUSES.IDLE,
  notifications: [],
  paging: {
    page: PAGINATE_NOTIFICATIONS.page,
    nextPage: 0,
    lastPage: 0,
    total: 0,
    totalUnread: 0,
  },
  isRedirect: false,
  isNotificationDesktopVisible: false,
  menuMobile: {
    isNotificationsMobileVisible: false,
    isMenuMobileVisible: false,
  },
  status: 'all',
  isStatusUnreadLoading: false,
};

const reducer = (state = initialState, action: Action) => {
  const { payload } = action;
  const { response, params, menuMobile = initialState.menuMobile, isNotificationDesktopVisible } = payload?.response || {};

  switch (action.type) {
    case REQUEST(notificationConstants.GET_NOTIFICATIONS):
      return {
        ...state,
        notificationLoadingStatus: LOADING_STATUSES.LOADING,
        isStatusUnreadLoading: !!payload?.params?.status && payload?.params?.status.toString() !== state.status.toString() && true,
      };
    case SUCCESS(notificationConstants.GET_NOTIFICATIONS): {
      const {
        data,
        meta: { count: total, totalUnread },
      } = response;
      const { page, isForceRefresh, status } = params;
      const notifications = isForceRefresh ? data : [...state.notifications, ...data];
      const lastPage = Math.ceil(total / PAGINATE_NOTIFICATIONS.limit);
      const nextPage = lastPage > page ? page + 1 : null;

      return {
        ...state,
        notificationLoadingStatus: LOADING_STATUSES.SUCCESS,
        notifications,
        paging: {
          page: nextPage,
          nextPage,
          lastPage,
          total,
          totalUnread,
        },
        status,
        isStatusUnreadLoading: params?.status.toString() !== state.status.toString() && false,
      };
    }
    case FAILURE(notificationConstants.GET_NOTIFICATIONS):
      return {
        ...state,
        notificationLoadingStatus: LOADING_STATUSES.ERROR,
        notifications: [],
        paging: {
          page: PAGINATE_NOTIFICATIONS.page,
          nextPage: 0,
          lastPage: 0,
          total: 0,
          totalUnread: 0,
        },
        status: 'all',
        isStatusUnreadLoading: params?.status.toString() !== state.status.toString() && false,
      };

    case REQUEST(notificationConstants.READ_NOTIFICATION):
      return {
        ...state,
        isRedirect: true,
      };
    case SUCCESS(notificationConstants.READ_NOTIFICATION): {
      return {
        ...state,
        isRedirect: false,
        paging: {
          ...state.paging,
          totalUnread: state.paging.totalUnread > 0 ? state.paging.totalUnread - 1 : 0,
        },
      };
    }
    case FAILURE(notificationConstants.READ_NOTIFICATION):
      return {
        ...state,
        isRedirect: false,
      };

    case REQUEST(notificationConstants.SET_MENU_MOBILE):
      return {
        ...state,
        menuMobile,
        isNotificationDesktopVisible,
      };
    default:
      return state;
  }
};

export default reducer;
