import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';

import authSaga from './sagas/authSaga';
import departmentSaga from './sagas/departmentSaga';
import organizationSaga from './sagas/organizationSaga';
import userManagementSaga from './sagas/userManagementSaga';
import businessUnitSaga from './sagas/businessUnitSaga';
import businessUnitSearchSaga from './sagas/businessUnitSearchSaga';
import regulationSaga from './sagas/regulationSaga';
import regulationTypeSaga from './sagas/regulationTypeSaga';
import taskSaga from './sagas/taskSaga';
import notificationSaga from './sagas/notificationSaga';

export const sagaMiddleware = createSagaMiddleware();

export default function* rootSaga() {
  yield all([
    authSaga(),
    departmentSaga(),
    organizationSaga(),
    userManagementSaga(),
    businessUnitSaga(),
    businessUnitSearchSaga(),
    regulationSaga(),
    regulationTypeSaga(),
    taskSaga(),
    notificationSaga(),
  ]);
}
