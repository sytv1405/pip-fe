import { put, all, call, takeLatest } from 'redux-saga/effects';

import { client } from '@/api/client';
import {
  URL_GET_LARGE_BUSINESS_UNIT_ALL_ROLES,
  URL_GET_MEDIUM_BUSINESS_UNIT_ALL_ROLES,
  URL_GET_SMALL_BUSINESS_UNIT_ALL_ROLES,
  URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH,
} from '@/shared/endpoints';
import { businessUnitSearchConstants, FAILURE, REQUEST, SUCCESS } from '@/redux/constants';
import { Action } from '@/types';

function* getLargeUnitForSearchByDepartmentIds({ payload: { params } }: Action) {
  try {
    const { data: largeBusinessUnitsForSearch } = yield call(() => client.get(URL_GET_LARGE_BUSINESS_UNIT_ALL_ROLES, { params }));
    yield put({
      type: SUCCESS(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH),
      payload: {
        largeBusinessUnitsForSearch,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH),
      error,
    });
  }
}

function* getMeidumUnitForSearchByMajorCategoryIds({ payload: { params, callback } }: Action) {
  try {
    const { data: mediumBusinessUnitsForSearch } = yield call(() => client.get(URL_GET_MEDIUM_BUSINESS_UNIT_ALL_ROLES, { params }));
    yield put({
      type: SUCCESS(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH),
      payload: {
        mediumBusinessUnitsForSearch: mediumBusinessUnitsForSearch.map(item => ({ ...item, majorCategoryId: params.majorCategoryIds[0] })),
      },
    });
    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH),
      error,
    });
  }
}

function* getSmallUnitForSearchByMiddleCategoryIds({ payload: { params } }: Action) {
  try {
    const { data: smallBusinessUnitsForSearch } = yield call(() => client.get(URL_GET_SMALL_BUSINESS_UNIT_ALL_ROLES, { params }));
    yield put({
      type: SUCCESS(businessUnitSearchConstants.GET_SMALL_UNITS_FOR_SEARCH),
      payload: {
        smallBusinessUnitsForSearch: smallBusinessUnitsForSearch.map(item => ({ ...item, middleCategoryId: params.middleCategoryIds[0] })),
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH),
      error,
    });
  }
}

function* getALLBusinessUnitForSearch({
  payload: {
    params: { departmentIds, majorCategoryIds, middleCategoryIds, minorCategoryId },
    callback,
  },
}: Action) {
  try {
    let mediumBusinessUnitsForSearch = [];
    let smallBusinessUnitsForSearch = [];
    let businessTasks = {};
    const { data: largeBusinessUnitsForSearch } = yield call(() =>
      client.get(URL_GET_LARGE_BUSINESS_UNIT_ALL_ROLES, { params: { departmentIds } })
    );
    if (majorCategoryIds?.length) {
      const [{ data: mediumBusinessUnits }, { data: tasks }] = yield all([
        call(() => client.get(URL_GET_MEDIUM_BUSINESS_UNIT_ALL_ROLES, { params: { majorCategoryIds } })),
        call(() => client.get(URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH, { params: { majorCategoryId: majorCategoryIds[0] } })),
      ]);
      mediumBusinessUnitsForSearch = mediumBusinessUnits.map(item => ({ ...item, majorCategoryId: majorCategoryIds[0] }));
      businessTasks = { ...businessTasks, [`major-${majorCategoryIds[0]}`]: tasks };
    }
    if (middleCategoryIds?.length) {
      const [{ data: smallBusinessUnits }, { data: tasks }] = yield all([
        call(() => client.get(URL_GET_SMALL_BUSINESS_UNIT_ALL_ROLES, { params: { middleCategoryIds } })),
        call(() => client.get(URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH, { params: { middleCategoryId: middleCategoryIds[0] } })),
      ]);
      smallBusinessUnitsForSearch = smallBusinessUnits.map(item => ({ ...item, middleCategoryId: middleCategoryIds[0] }));
      businessTasks = { ...businessTasks, [`middle-${middleCategoryIds[0]}`]: tasks };
    }
    if (minorCategoryId) {
      const { data: tasks } = yield call(() => client.get(URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH, { params: { minorCategoryId } }));
      businessTasks = { ...businessTasks, [`minor-${minorCategoryId}`]: tasks };
    }
    yield put({
      type: SUCCESS(businessUnitSearchConstants.GET_ALL_BUSINESS_FOR_SEARCH),
      payload: {
        largeBusinessUnitsForSearch,
        mediumBusinessUnitsForSearch,
        smallBusinessUnitsForSearch,
        businessTasks,
      },
    });
    callback?.({ largeBusinessUnitsForSearch, mediumBusinessUnitsForSearch, smallBusinessUnitsForSearch, businessTasks });
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitSearchConstants.GET_ALL_BUSINESS_FOR_SEARCH),
      error,
    });
  }
}

export default function* businessUnitSaga() {
  yield all([takeLatest(REQUEST(businessUnitSearchConstants.GET_LARGE_UNITS_FOR_SEARCH), getLargeUnitForSearchByDepartmentIds)]);
  yield all([takeLatest(REQUEST(businessUnitSearchConstants.GET_MEDIUM_UNITS_FOR_SEARCH), getMeidumUnitForSearchByMajorCategoryIds)]);
  yield all([takeLatest(REQUEST(businessUnitSearchConstants.GET_SMALL_UNITS_FOR_SEARCH), getSmallUnitForSearchByMiddleCategoryIds)]);
  yield all([takeLatest(REQUEST(businessUnitSearchConstants.GET_ALL_BUSINESS_FOR_SEARCH), getALLBusinessUnitForSearch)]);
}
