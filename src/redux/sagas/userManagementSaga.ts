import { all, call, put, takeEvery } from 'redux-saga/effects';

import { client } from '@/api/client';
import { URL_GET_USERS } from '@/shared/endpoints';
import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { usersConstant } from '../constants/userManagement';

function* getUsers(action: Action) {
  const { params } = action.payload || {};
  try {
    const { data, meta } = yield call(() => client.get(URL_GET_USERS, { params }));
    yield put({
      type: SUCCESS(usersConstant.GET_USERS),
      payload: { response: { data, meta } },
    });
  } catch (error) {
    yield put({
      type: FAILURE(usersConstant.GET_USERS),
      error,
    });
  }
}

function* createUser(action: Action) {
  const { params, callback, errorCallback } = action.payload || {};
  try {
    const { data } = yield call(() => client.post(URL_GET_USERS, params));
    if (callback) callback();
    yield put({
      type: SUCCESS(usersConstant.CREATE_USER),
      payload: { response: { data } },
    });
  } catch (error) {
    errorCallback?.(error);
    yield put({
      type: FAILURE(usersConstant.CREATE_USER),
      error,
    });
  }
}

function* getUserDetail(action: Action) {
  const { params, errorCallback } = action.payload || {};
  try {
    const { data } = yield call(() => client.get(`${URL_GET_USERS}/${params.id}`));
    yield put({
      type: SUCCESS(usersConstant.GET_USER_DETAIL),
      payload: { response: { data } },
    });
  } catch (error) {
    errorCallback?.();
    yield put({
      type: FAILURE(usersConstant.GET_USER_DETAIL),
      error,
    });
  }
}

function* updateUser(action: Action) {
  const { params, callback, errorCallback } = action.payload || {};
  try {
    const { data } = yield call(() => client.patch(`${URL_GET_USERS}/${params.id}`, params));
    if (callback) {
      callback();
    }
    yield put({
      type: SUCCESS(usersConstant.UPDATE_USER),
      payload: {
        response: data,
      },
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);
    yield put({
      type: FAILURE(usersConstant.UPDATE_USER),
    });
  }
}

function* deleteUser(action: Action) {
  const { params, callback, errorCallback } = action.payload || {};
  try {
    const { data } = yield call(() => client.delete(`${URL_GET_USERS}/${params.id}`));
    if (callback) {
      callback();
    }
    yield put({
      type: SUCCESS(usersConstant.DELETE_USER),
      payload: { response: { data } },
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);
    yield put({
      type: FAILURE(usersConstant.DELETE_USER),
      error,
    });
  }
}

function* resendPasswordUser(action: Action) {
  const { params, callback, errorCallback } = action.payload || {};
  try {
    const { data } = yield call(() => client.get(`admin/users/${params.id}/resend-temporary-password`, params));
    if (callback) {
      callback();
    }
    yield put({
      type: SUCCESS(usersConstant.RESEND_PASSWORD),
      payload: { response: { data } },
    });
  } catch (error) {
    if (errorCallback) errorCallback();
    yield put({
      type: FAILURE(usersConstant.RESEND_PASSWORD),
      error,
    });
  }
}

function* resetPassword(action: Action) {
  const { params, callback, errorCallback } = action.payload || {};
  try {
    const { data } = yield call(() => client.get(`admin/users/${params.id}/reset-password`));

    if (callback) {
      callback();
    }

    yield put({
      type: SUCCESS(usersConstant.RESET_PASSWORD),
      payload: { response: { data } },
    });
  } catch (error) {
    if (errorCallback) errorCallback();

    yield put({
      type: FAILURE(usersConstant.RESET_PASSWORD),
      error,
    });
  }
}

export default function* departmentSaga() {
  yield all([
    takeEvery(REQUEST(usersConstant.GET_USERS), getUsers),
    takeEvery(REQUEST(usersConstant.CREATE_USER), createUser),
    takeEvery(REQUEST(usersConstant.GET_USER_DETAIL), getUserDetail),
    takeEvery(REQUEST(usersConstant.UPDATE_USER), updateUser),
    takeEvery(REQUEST(usersConstant.DELETE_USER), deleteUser),
    takeEvery(REQUEST(usersConstant.RESEND_PASSWORD), resendPasswordUser),
    takeEvery(REQUEST(usersConstant.RESET_PASSWORD), resetPassword),
  ]);
}
