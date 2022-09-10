import { put, all, call, takeLatest } from 'redux-saga/effects';

import { client } from '@/api/client';
import {
  URL_CREATE_LARGE_BUSINESS_UNIT,
  URL_CREATE_MEDIUM_BUSINESS_UNIT,
  URL_CREATE_SMALL_BUSINESS_UNIT,
  URL_GET_LARGE_BUSINESS_UNIT,
  URL_GET_MEDIUM_BUSINESS_UNIT,
  URL_UPDATE_LARGE_BUSINESS_UNIT,
  URL_UPDATE_MEDIUM_BUSINESS_UNIT,
  URL_UPDATE_SMALL_BUSINESS_UNIT,
  URL_GET_SMALL_BUSINESS_UNIT,
  URL_DELETE_LARGE_BUSINESS_UNIT,
  URL_DELETE_MEDIUM_BUSINESS_UNIT,
  URL_DELETE_SMALL_BUSINESS_UNIT,
  URL_ORDER_LARGE_BUSINESS_UNIT,
  URL_ORDER_MEDIUM_BUSINESS_UNIT,
  URL_ORDER_SMALL_BUSINESS_UNIT,
  URL_DOWNLOAD_BUSINESS_UNIT,
  URL_BULK_INSERT_MAJOR,
  URL_BULK_INSERT_MIDDLE,
  URL_BULK_INSERT_MINOR,
  URL_GET_BUSINESS_UNITS_RELATIVE,
} from '@/shared/endpoints';
import { businessUnitConstants, FAILURE, REQUEST, SUCCESS } from '@/redux/constants';
import { Action } from '@/types';
import { BusinessUnitLevel } from '@/shared/enum';

function* getLargeBusinessUnitBy({ payload: { params } }: Action) {
  try {
    const { data: largeBusinessUnits } = yield call(() => client.get(URL_GET_LARGE_BUSINESS_UNIT, { params }));
    yield put({
      type: SUCCESS(businessUnitConstants.GET_LARGE_UNITS),
      payload: {
        largeBusinessUnits,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.GET_LARGE_UNITS),
      error,
    });
  }
}

function* getMediumBusinessUnitBy({ payload: { params } }: Action) {
  try {
    const { data: mediumBusinessUnits } = yield call(() => client.get(URL_GET_MEDIUM_BUSINESS_UNIT, { params }));
    yield put({
      type: SUCCESS(businessUnitConstants.GET_MEDIUM_UNITS),
      payload: {
        mediumBusinessUnits,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.GET_MEDIUM_UNITS),
      error,
    });
  }
}

function* createLargeBusinessUnit({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.post(URL_CREATE_LARGE_BUSINESS_UNIT, params));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.CREATE_LARGE_UNIT),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.CREATE_LARGE_UNIT),
      error,
    });
  }
}

function* createMediumBusinessUnit({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.post(URL_CREATE_MEDIUM_BUSINESS_UNIT, params));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.CREATE_MEDIUM_UNIT),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.CREATE_MEDIUM_UNIT),
      error,
    });
  }
}

function* createSmallBusinessUnit({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.post(URL_CREATE_SMALL_BUSINESS_UNIT, params));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.CREATE_SMALL_UNIT),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.CREATE_SMALL_UNIT),
      error,
    });
  }
}

function* getLargeBusinessUnitDetails({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const { data: largeBusinessUnitDetails } = yield call(() => client.get(`${URL_GET_LARGE_BUSINESS_UNIT}/${params}`));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.GET_LARGE_UNIT_DETAILS),
      payload: {
        largeBusinessUnitDetails,
      },
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.GET_LARGE_UNIT_DETAILS),
      error,
    });
  }
}

function* getMediumBusinessUnitDetails({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const { data: mediumBusinessUnitDetails } = yield call(() => client.get(`${URL_GET_MEDIUM_BUSINESS_UNIT}/${params}`));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS),
      payload: {
        mediumBusinessUnitDetails,
      },
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS),
      error,
    });
  }
}

function* getSmallBusinessUnitDetails({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const { data: smallBusinessUnitDetails } = yield call(() => client.get(`${URL_GET_SMALL_BUSINESS_UNIT}/${params}`));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.GET_SMALL_UNIT_DETAILS),
      payload: {
        smallBusinessUnitDetails,
      },
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.GET_SMALL_UNIT_DETAILS),
      error,
    });
  }
}

function* updateLargeBusinessUnit({
  payload: {
    params: { id, ...rest },
    callback,
    errorCallback,
  },
}: Action) {
  try {
    yield call(() => client.patch(`${URL_UPDATE_LARGE_BUSINESS_UNIT}/${id}`, rest));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.UPDATE_LARGE_UNIT),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.UPDATE_LARGE_UNIT),
      error,
    });
  }
}

function* updateMediumBusinessUnit({
  payload: {
    params: { id, ...rest },
    callback,
    errorCallback,
  },
}: Action) {
  try {
    yield call(() => client.patch(`${URL_UPDATE_MEDIUM_BUSINESS_UNIT}/${id}`, rest));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.UPDATE_MEDIUM_UNIT),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.UPDATE_MEDIUM_UNIT),
      error,
    });
  }
}

function* updateSmallBusinessUnit({
  payload: {
    params: { id, ...rest },
    callback,
    errorCallback,
  },
}: Action) {
  try {
    yield call(() => client.patch(`${URL_UPDATE_SMALL_BUSINESS_UNIT}/${id}`, rest));

    callback?.();

    yield put({
      type: SUCCESS(businessUnitConstants.UPDATE_SMALL_UNIT),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(businessUnitConstants.UPDATE_SMALL_UNIT),
      error,
    });
  }
}

function* searchBusinessUnit({ payload: { params, callback } }: Action) {
  const { businessLevel, ...rest } = params;
  let endpoint = URL_GET_LARGE_BUSINESS_UNIT;

  switch (businessLevel) {
    case BusinessUnitLevel.large:
      endpoint = URL_GET_LARGE_BUSINESS_UNIT;
      break;
    case BusinessUnitLevel.medium:
      endpoint = URL_GET_MEDIUM_BUSINESS_UNIT;
      break;
    default:
      endpoint = URL_GET_SMALL_BUSINESS_UNIT;
      break;
  }

  try {
    const { data: businessUnitSearch } = yield call(() => client.get(endpoint, { params: rest }));
    yield put({
      type: SUCCESS(businessUnitConstants.SEARCH_BUSINESS_UNIT),
      payload: {
        businessUnitSearch,
      },
    });
    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.SEARCH_BUSINESS_UNIT),
      error,
    });
  }
}

function* deleteLargeBusinessUnit({
  payload: {
    params: { id },
    callback,
    errorCallback,
  },
}: Action) {
  try {
    yield call(() => client.delete(`${URL_DELETE_LARGE_BUSINESS_UNIT}/${id}`));

    yield put({
      type: SUCCESS(businessUnitConstants.DELETE_LARGE_UNIT),
    });

    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.DELETE_LARGE_UNIT),
      error,
    });
    errorCallback?.();
  }
}

function* deleteMediumBusinessUnit({
  payload: {
    params: { id },
    callback,
    errorCallback,
  },
}: Action) {
  try {
    yield call(() => client.delete(`${URL_DELETE_MEDIUM_BUSINESS_UNIT}/${id}`));

    yield put({
      type: SUCCESS(businessUnitConstants.DELETE_LARGE_UNIT),
    });

    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.DELETE_LARGE_UNIT),
      error,
    });

    errorCallback?.();
  }
}

function* deleteSmallBusinessUnit({
  payload: {
    params: { id },
    callback,
    errorCallback,
  },
}: Action) {
  try {
    yield call(() => client.delete(`${URL_DELETE_SMALL_BUSINESS_UNIT}/${id}`));

    yield put({
      type: SUCCESS(businessUnitConstants.DELETE_LARGE_UNIT),
    });

    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.DELETE_LARGE_UNIT),
      error,
    });

    errorCallback?.();
  }
}

function* bulkInsertBusinessUnit({
  payload: {
    params: { businessType, ...data },
    callback,
    errorCallback,
  },
}: Action) {
  let endpoint = '';
  switch (businessType) {
    case BusinessUnitLevel.large:
      endpoint = URL_BULK_INSERT_MAJOR;
      break;
    case BusinessUnitLevel.medium:
      endpoint = URL_BULK_INSERT_MIDDLE;
      break;
    default:
      endpoint = URL_BULK_INSERT_MINOR;
      break;
  }
  try {
    const response = yield call(client.post, endpoint, data);

    if (callback) callback(response);

    yield put({
      type: SUCCESS(businessUnitConstants.BULK_INSERT_BUSINESS_UNIT),
    });
  } catch (error) {
    if (errorCallback) errorCallback(error);

    yield put({
      type: FAILURE(businessUnitConstants.BULK_INSERT_BUSINESS_UNIT),
    });
  }
}

function* sortBusinessUnit({ payload: { params, callback } }: Action) {
  const { businessLevel, categories } = params;
  let endpoint = URL_ORDER_LARGE_BUSINESS_UNIT;
  let payload = {};

  switch (businessLevel) {
    case BusinessUnitLevel.large:
      endpoint = URL_ORDER_LARGE_BUSINESS_UNIT;
      payload = {
        majorCategories: categories,
      };
      break;
    case BusinessUnitLevel.medium:
      endpoint = URL_ORDER_MEDIUM_BUSINESS_UNIT;
      payload = {
        middleCategories: categories,
      };
      break;
    default:
      endpoint = URL_ORDER_SMALL_BUSINESS_UNIT;
      payload = {
        minorCategories: categories,
      };
      break;
  }

  try {
    yield call(() => client.post(endpoint, payload));
    yield put({
      type: SUCCESS(businessUnitConstants.SORT_BUSINESS_UNIT),
    });
    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.SORT_BUSINESS_UNIT),
      error,
    });
  }
}

function* downloadBusinessUnit({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const { data: response } = yield call(client.get, URL_DOWNLOAD_BUSINESS_UNIT, { params });
    callback?.(response);
    yield put({
      type: SUCCESS(businessUnitConstants.DOWNLOAD_BUSINESS_UNIT),
    });
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.DOWNLOAD_BUSINESS_UNIT),
      error,
    });

    errorCallback?.();
  }
}

function* getBusinessUnitsRelative() {
  try {
    const { data: response } = yield call(client.get, URL_GET_BUSINESS_UNITS_RELATIVE);

    yield put({
      type: SUCCESS(businessUnitConstants.GET_BUSINESS_UNITS_RELATIVE),
      payload: {
        response,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(businessUnitConstants.GET_BUSINESS_UNITS_RELATIVE),
      error,
    });
  }
}

export default function* businessUnitSaga() {
  yield all([takeLatest(REQUEST(businessUnitConstants.GET_LARGE_UNITS), getLargeBusinessUnitBy)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.GET_MEDIUM_UNITS), getMediumBusinessUnitBy)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.CREATE_LARGE_UNIT), createLargeBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.CREATE_MEDIUM_UNIT), createMediumBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.CREATE_SMALL_UNIT), createSmallBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.GET_LARGE_UNIT_DETAILS), getLargeBusinessUnitDetails)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.GET_MEDIUM_UNIT_DETAILS), getMediumBusinessUnitDetails)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.GET_SMALL_UNIT_DETAILS), getSmallBusinessUnitDetails)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.UPDATE_LARGE_UNIT), updateLargeBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.UPDATE_MEDIUM_UNIT), updateMediumBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.UPDATE_SMALL_UNIT), updateSmallBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.SEARCH_BUSINESS_UNIT), searchBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.DELETE_LARGE_UNIT), deleteLargeBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.DELETE_MEDIUM_UNIT), deleteMediumBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.DELETE_SMALL_UNIT), deleteSmallBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.BULK_INSERT_BUSINESS_UNIT), bulkInsertBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.SORT_BUSINESS_UNIT), sortBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.DOWNLOAD_BUSINESS_UNIT), downloadBusinessUnit)]);
  yield all([takeLatest(REQUEST(businessUnitConstants.GET_BUSINESS_UNITS_RELATIVE), getBusinessUnitsRelative)]);
}
