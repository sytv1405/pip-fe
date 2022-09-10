import { put, all, takeEvery, call } from 'redux-saga/effects';

import { client } from '@/api/client';
import {
  URL_CREATE_ORGANIZATION,
  URL_GET_ORGANIZATIONS,
  URL_GET_ORGANIZATION,
  URL_UPDATE_ORGANIZATION,
  URL_DELETE_ORGANIZATION,
} from '@/shared/endpoints';
import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { organizationConstants } from '../constants/organization';

function* getOrganizations(action: Action) {
  const { params } = action.payload || {};

  try {
    const { data: organizations } = yield call(() => client.get(URL_GET_ORGANIZATIONS, { params }));
    yield put({
      type: SUCCESS(organizationConstants.GET_ORGANIZATIONS),
      payload: {
        organizations,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(organizationConstants.GET_ORGANIZATIONS),
      error,
    });
  }
}

function* getOrganization({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const { data: organization } = yield call(() => client.get(`${URL_GET_ORGANIZATION}/${params.id}`));

    callback?.(organization);

    yield put({
      type: SUCCESS(organizationConstants.GET_ORGANIZATION),
      payload: {
        organization,
      },
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(organizationConstants.GET_ORGANIZATION),
      error,
    });
  }
}

function* createOrganization({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.post(URL_CREATE_ORGANIZATION, params));

    if (callback) callback();

    yield put({
      type: SUCCESS(organizationConstants.CREATE_ORGANIZATION),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);

    yield put({
      type: FAILURE(organizationConstants.CREATE_ORGANIZATION),
      error,
    });
  }
}

function* updateOrganization({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.patch(`${URL_UPDATE_ORGANIZATION}/${params.id}`, params.data));

    if (callback) callback();

    yield put({
      type: SUCCESS(organizationConstants.UPDATE_ORGANIZATION),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);

    yield put({
      type: FAILURE(organizationConstants.UPDATE_ORGANIZATION),
      error,
    });
  }
}

function* deleteOrganization({
  payload: {
    params: { id, isHardDeleted },
    callback,
    errorCallback,
  },
}: Action) {
  try {
    yield call(() =>
      client.delete(`${URL_DELETE_ORGANIZATION}/${id}`, {
        params: { isHardDeleted },
      })
    );

    if (callback) callback();

    yield put({
      type: SUCCESS(organizationConstants.DELETE_ORGANIZATION),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);

    yield put({
      type: FAILURE(organizationConstants.DELETE_ORGANIZATION),
      error,
    });
  }
}

export default function* organizationSaga() {
  yield all([
    takeEvery(REQUEST(organizationConstants.GET_ORGANIZATIONS), getOrganizations),
    takeEvery(REQUEST(organizationConstants.CREATE_ORGANIZATION), createOrganization),
    takeEvery(REQUEST(organizationConstants.GET_ORGANIZATION), getOrganization),
    takeEvery(REQUEST(organizationConstants.UPDATE_ORGANIZATION), updateOrganization),
    takeEvery(REQUEST(organizationConstants.DELETE_ORGANIZATION), deleteOrganization),
  ]);
}
