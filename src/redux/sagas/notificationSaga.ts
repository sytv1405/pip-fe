import { put, all, takeEvery, call } from 'redux-saga/effects';

import { client } from '@/api/client';
import { URL_GET_NOTIFICATIONS, URL_READ_NOTIFICATION } from '@/shared/endpoints';
import { Action } from '@/types';

import { FAILURE, notificationConstants, REQUEST, SUCCESS } from '../constants';

function* getNotifications(action: Action) {
  const { params } = action.payload || {};

  try {
    const response = yield call(() => client.get(URL_GET_NOTIFICATIONS, { params }));
    yield put({
      type: SUCCESS(notificationConstants.GET_NOTIFICATIONS),
      payload: {
        response: { response, params },
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(notificationConstants.GET_NOTIFICATIONS),
      error,
    });
  }
}

function* readNotifications(action: Action) {
  const {
    params: { notificationId },
    callback,
  } = action.payload || {};

  try {
    yield call(() => client.patch(URL_READ_NOTIFICATION.replace('[notificationId]', notificationId)));
    yield put({
      type: SUCCESS(notificationConstants.READ_NOTIFICATION),
    });
    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(notificationConstants.READ_NOTIFICATION),
      error,
    });
  }
}

export default function* regulationSaga() {
  yield all([takeEvery(REQUEST(notificationConstants.GET_NOTIFICATIONS), getNotifications)]);
  yield all([takeEvery(REQUEST(notificationConstants.READ_NOTIFICATION), readNotifications)]);
}
