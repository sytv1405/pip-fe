import { put, all, takeEvery, call } from 'redux-saga/effects';

import { client } from '@/api/client';
import {
  URL_CREATE_DEPARTMENT,
  URL_GET_DEPARTMENTS,
  URL_DELETE_DEPARTMENT,
  URL_UPDATE_DEPARTMENT,
  URL_BULK_UPDATE_DEPARTMENTS,
  URL_BULK_INSERT_DEPARTMENTS,
  URL_GET_DEPARTMENTS_FOR_BUSINESS_UNIT,
  URL_SEARCH_DEPARTMENTS,
} from '@/shared/endpoints';
import { Action } from '@/types';

import { FAILURE, REQUEST, SUCCESS } from '../constants';
import { departmentConstants } from '../constants/department';

function* getDepartments() {
  try {
    const { data: departments } = yield call(() => client.get(URL_GET_DEPARTMENTS));
    yield put({
      type: SUCCESS(departmentConstants.GET_DEPARTMENTS),
      payload: {
        departments,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(departmentConstants.GET_DEPARTMENTS),
      error,
    });
  }
}

function* searchDepartments({ payload: { params } }: Action) {
  try {
    const { data: departments } = yield call(client.get, URL_SEARCH_DEPARTMENTS, { params });
    yield put({
      type: SUCCESS(departmentConstants.SEARCH_DEPARTMENTS),
      payload: {
        departments,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(departmentConstants.SEARCH_DEPARTMENTS),
      error,
    });
  }
}

function* getDepartmentsForBusinessUnit() {
  try {
    const { data: departmentsForSearchUnit } = yield call(() => client.get(URL_GET_DEPARTMENTS_FOR_BUSINESS_UNIT));
    yield put({
      type: SUCCESS(departmentConstants.GET_DEPARTMENTS_FOR_BUSINESS_UNIT),
      payload: {
        departmentsForSearchUnit,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(departmentConstants.GET_DEPARTMENTS_FOR_BUSINESS_UNIT),
      error,
    });
  }
}

function* getDepartmentDetail(action: Action) {
  const { params, errorCallback } = action.payload || {};
  try {
    const { data } = yield call(() => client.get(`${URL_GET_DEPARTMENTS}/${params.id}`));
    yield put({
      type: SUCCESS(departmentConstants.GET_DEPARTMENT_DETAIL),
      payload: { response: { data } },
    });
  } catch (error) {
    errorCallback?.();
    yield put({
      type: FAILURE(departmentConstants.GET_DEPARTMENT_DETAIL),
      error,
    });
  }
}

function* createDepartment({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.post(URL_CREATE_DEPARTMENT, params));

    if (callback) callback();

    yield put({
      type: SUCCESS(departmentConstants.CREATE_DEPARTMENT),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);

    yield put({
      type: FAILURE(departmentConstants.CREATE_DEPARTMENT),
      error,
    });
  }
}

function* deleteDepartment({
  payload: {
    params: { id },
    callback,
    finalCallback,
  },
}: Action) {
  try {
    yield call(() => client.delete(`${URL_DELETE_DEPARTMENT}/${id}`));
    yield put({
      type: SUCCESS(departmentConstants.DELETE_DEPARTMENT),
      payload: { params: { id } },
    });
    if (callback) callback();
  } catch (error) {
    yield put({
      type: FAILURE(departmentConstants.DELETE_DEPARTMENT),
    });
  } finally {
    if (finalCallback) finalCallback();
  }
}

function* updateDepartment(action: Action) {
  const { params, callback, errorCallback } = action.payload || {};
  try {
    const { data } = yield call(() => client.patch(`${URL_UPDATE_DEPARTMENT}/${params.id}`, { name: params.name }));
    if (callback) {
      callback();
    }
    yield put({
      type: SUCCESS(departmentConstants.UPDATE_DEPARTMENT),
      payload: {
        response: data,
      },
    });
  } catch (error) {
    if (errorCallback) errorCallback();
    yield put({
      type: FAILURE(departmentConstants.UPDATE_DEPARTMENT),
    });
  }
}

function* bulkUpdateDepartments({ payload: { params, callback } }: Action) {
  try {
    yield call(() => client.put(URL_BULK_UPDATE_DEPARTMENTS, params));

    if (callback) callback();

    yield put({
      type: SUCCESS(departmentConstants.BULK_UPDATE_DEPARTMENTS),
    });
  } catch (error) {
    yield put({
      type: FAILURE(departmentConstants.BULK_UPDATE_DEPARTMENTS),
    });
  }
}

function* bulkInsertDepartments({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const { data } = yield call(() => client.post(URL_BULK_INSERT_DEPARTMENTS, params));

    if (callback) callback(data);

    yield put({
      type: SUCCESS(departmentConstants.BULK_INSERT_DEPARTMENTS),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);

    yield put({
      type: FAILURE(departmentConstants.BULK_INSERT_DEPARTMENTS),
    });
  }
}

function* getDepartmentsEditUser(action: Action) {
  const { params } = action?.payload || {};
  try {
    const { data: departmentsForEditUser } = yield call(() => client.get(URL_GET_DEPARTMENTS, { params }));
    yield put({
      type: SUCCESS(departmentConstants.GET_DEPARTMENTS_FOR_EDIT_USER),
      payload: {
        departmentsForEditUser,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(departmentConstants.GET_DEPARTMENTS_FOR_EDIT_USER),
      error,
    });
  }
}

export default function* departmentSaga() {
  yield all([
    takeEvery(REQUEST(departmentConstants.GET_DEPARTMENTS), getDepartments),
    takeEvery(REQUEST(departmentConstants.SEARCH_DEPARTMENTS), searchDepartments),
    takeEvery(REQUEST(departmentConstants.GET_DEPARTMENT_DETAIL), getDepartmentDetail),
    takeEvery(REQUEST(departmentConstants.CREATE_DEPARTMENT), createDepartment),
    takeEvery(REQUEST(departmentConstants.DELETE_DEPARTMENT), deleteDepartment),
    takeEvery(REQUEST(departmentConstants.UPDATE_DEPARTMENT), updateDepartment),
    takeEvery(REQUEST(departmentConstants.BULK_UPDATE_DEPARTMENTS), bulkUpdateDepartments),
    takeEvery(REQUEST(departmentConstants.BULK_INSERT_DEPARTMENTS), bulkInsertDepartments),
    takeEvery(REQUEST(departmentConstants.GET_DEPARTMENTS_FOR_BUSINESS_UNIT), getDepartmentsForBusinessUnit),
    takeEvery(REQUEST(departmentConstants.GET_DEPARTMENTS_FOR_EDIT_USER), getDepartmentsEditUser),
  ]);
}
