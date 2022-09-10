import { put, all, takeEvery, call } from 'redux-saga/effects';

import { client } from '@/api/client';
import { URL_CREATE_REGULATION_TYPES, URL_GET_REGULATION_TYPES, URL_GET_REGULATION_TYPES_ALL_ROLES } from '@/shared/endpoints';
import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { regulationTypeConstants } from '../constants/regulationType';

function* getRegulationTypes() {
  try {
    const { data: regulationTypes } = yield call(() => client.get(URL_GET_REGULATION_TYPES));
    yield put({
      type: SUCCESS(regulationTypeConstants.GET_REGULATION_TYPES),
      payload: {
        regulationTypes,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(regulationTypeConstants.GET_REGULATION_TYPES),
      error,
    });
  }
}

function* createRegulationTypes(action: Action) {
  const { params, callback, errorCallback } = action.payload || {};
  try {
    yield call(() => client.post(URL_CREATE_REGULATION_TYPES, params));
    if (callback) callback();
    yield put({
      type: SUCCESS(regulationTypeConstants.CREATE_REGULATION_TYPES),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);
    yield put({
      type: FAILURE(regulationTypeConstants.CREATE_REGULATION_TYPES),
      error,
    });
  }
}

function* deleteRegulationTypes(action: Action) {
  const { params, callback, errorCallback } = action.payload || {};
  try {
    yield call(() => client.delete(`${URL_GET_REGULATION_TYPES_ALL_ROLES}/${params.id}`));
    if (callback) callback();
    yield put({
      type: SUCCESS(regulationTypeConstants.DELETE_REGULATION_TYPES),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);
    yield put({
      type: FAILURE(regulationTypeConstants.DELETE_REGULATION_TYPES),
      error,
    });
  }
}

export default function* regulationTypeSaga() {
  yield all([
    takeEvery(REQUEST(regulationTypeConstants.GET_REGULATION_TYPES), getRegulationTypes),
    takeEvery(REQUEST(regulationTypeConstants.CREATE_REGULATION_TYPES), createRegulationTypes),
    takeEvery(REQUEST(regulationTypeConstants.DELETE_REGULATION_TYPES), deleteRegulationTypes),
  ]);
}
