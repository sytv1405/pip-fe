import { put, all, takeEvery, call } from 'redux-saga/effects';

import { client } from '@/api/client';
import { URL_GET_USER } from '@/shared/endpoints';

import { authConstants, REQUEST, SUCCESS, FAILURE } from '../constants';

function* getUser() {
  try {
    const { data } = yield call(() => client.get(URL_GET_USER));
    yield put({
      type: SUCCESS(authConstants.GET_USER),
      payload: {
        response: data,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(authConstants.GET_USER),
    });
  }
}

function* authSaga() {
  yield all([takeEvery(REQUEST(authConstants.GET_USER), getUser)]);
}

export default authSaga;
