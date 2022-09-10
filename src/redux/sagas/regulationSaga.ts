import { put, all, takeEvery, call } from 'redux-saga/effects';

import { client } from '@/api/client';
import {
  URL_GET_REGULATIONS,
  URL_GET_REGULATION,
  URL_CREATE_REGULATION,
  URL_UPDATE_REGULATION,
  URL_DELETE_REGULATIONS,
  URL_BULK_INSERT_REGULATIONS,
} from '@/shared/endpoints';
import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { regulationConstants } from '../constants/regulation';

function* getRegulations(action: Action) {
  const { params } = action.payload || {};

  try {
    const { data: regulations } = yield call(() => client.get(URL_GET_REGULATIONS, { params }));
    yield put({
      type: SUCCESS(regulationConstants.GET_REGULATIONS),
      payload: {
        regulations,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(regulationConstants.GET_REGULATIONS),
      error,
    });
  }
}

function* createRegulation({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.post(URL_CREATE_REGULATION, params));

    if (callback) callback();

    yield put({
      type: SUCCESS(regulationConstants.CREATE_REGULATION),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);

    yield put({
      type: FAILURE(regulationConstants.CREATE_REGULATION),
      error,
    });
  }
}

function* getRegulation({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const { data: regulation } = yield call(() => client.get(`${URL_GET_REGULATION}/${params.id}`));

    callback?.(regulation);

    yield put({
      type: SUCCESS(regulationConstants.GET_REGULATION),
      payload: { regulation },
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(regulationConstants.GET_REGULATION),
      error,
    });
  }
}

function* deleteRegulations({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.post(URL_DELETE_REGULATIONS, params));

    callback?.();

    yield put({
      type: SUCCESS(regulationConstants.DELETE_REGULATIONS),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(regulationConstants.DELETE_REGULATIONS),
    });
  }
}

function* bulkInsertRegulations({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const response = yield call(() => client.post(URL_BULK_INSERT_REGULATIONS, params));

    if (callback) callback(response);

    yield put({
      type: SUCCESS(regulationConstants.BULK_INSERT_REGULATIONS),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);

    yield put({
      type: FAILURE(regulationConstants.BULK_INSERT_REGULATIONS),
      error,
    });
  }
}

function* updateRegulation({
  payload: {
    params: { id, data },
    callback,
    errorCallback,
  },
}: Action) {
  try {
    yield call(() => client.patch(`${URL_UPDATE_REGULATION}/${id}`, data));

    callback?.();

    yield put({
      type: SUCCESS(regulationConstants.UPDATE_REGULATION),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(regulationConstants.UPDATE_REGULATION),
    });
  }
}

export default function* regulationSaga() {
  yield all([
    takeEvery(REQUEST(regulationConstants.GET_REGULATIONS), getRegulations),
    takeEvery(REQUEST(regulationConstants.CREATE_REGULATION), createRegulation),
    takeEvery(REQUEST(regulationConstants.GET_REGULATION), getRegulation),
    takeEvery(REQUEST(regulationConstants.UPDATE_REGULATION), updateRegulation),
    takeEvery(REQUEST(regulationConstants.DELETE_REGULATIONS), deleteRegulations),
    takeEvery(REQUEST(regulationConstants.BULK_INSERT_REGULATIONS), bulkInsertRegulations),
  ]);
}
