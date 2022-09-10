import { put, all, takeEvery, call, takeLatest } from 'redux-saga/effects';
import { groupBy } from 'lodash';

import { Action } from '@/types';
import { client } from '@/api/client';
import {
  URL_GET_LARGE_BUSINESS_UNIT_ALL_ROLES,
  URL_GET_MEDIUM_BUSINESS_UNIT_ALL_ROLES,
  URL_GET_SMALL_BUSINESS_UNIT_ALL_ROLES,
  URL_GET_DEPARTMENTS_ALL_ROLES,
  URL_GET_TASKS,
  URL_GET_REGULATION_TYPES_ALL_ROLES,
  URL_GET_REGULATIONS_ALL_ROLES,
  URL_BULK_UPDATE_TASKS,
  URL_CREATE_TASK,
  URL_GET_TASK_DETAIL,
  URL_UPDATE_TASK_TRANSACTION,
  URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH,
  URL_UPDATE_TASK,
  URL_CREATE_TASK_TRANSACTION,
  URL_BULK_INSERT_TASKS,
  URL_GET_TASKS_EXPORT_EXCEL,
  URL_GET_TODO_TASKS,
  URL_UPDATE_TASK_TRANSACTION_PROCESS_STATUS,
  URL_GET_TASK_CALENDAR,
  URL_MARK_TASK_FAVORITE,
  URL_MARK_TRANSACTION_FAVORITE,
  URL_GET_TASK_BY_BUSINESS,
  URL_GET_TRANSACTIONS,
  URL_GET_TASK_FOR_REGISTER_BULK_TRANSACTION,
  URL_CREATE_TRANSACTION_BULK,
  URL_GET_DEADLINE_TASK,
  URL_GET_COMMENTS,
  URL_CREATE_COMMENT,
  URL_DELETE_COMMENT,
  URL_UPDATE_COMMENT,
} from '@/shared/endpoints';

import { taskConstants, REQUEST, SUCCESS, FAILURE, usersConstant } from '../constants';

function* getTasks(action: Action) {
  const { params } = action?.payload || {};
  try {
    const { data, meta } = yield call(() => client.get(URL_GET_TASKS, { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_TASKS),
      payload: { response: { data, meta } },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_TASKS),
      error,
    });
  }
}

function* getTransactions(action: Action) {
  const { params } = action?.payload || {};
  try {
    const { data, meta } = yield call(() => client.get(URL_GET_TRANSACTIONS(params?.taskId), { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_TRANSACTIONS),
      payload: { response: { data, meta } },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_TRANSACTIONS),
      error,
    });
  }
}

function* initializeCreateTaskForm() {
  try {
    const [{ data: departments }, { data: regulationTypes }, { data: regulations }] = yield all([
      call(() => client.get(URL_GET_DEPARTMENTS_ALL_ROLES)),
      call(() => client.get(URL_GET_REGULATION_TYPES_ALL_ROLES)),
      call(() => client.get(URL_GET_REGULATIONS_ALL_ROLES)),
    ]);

    yield put({
      type: SUCCESS(taskConstants.INITIALIZE_CREATE_TASK_FROM),
      payload: {
        response: { departments, regulationTypes, regulations },
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.INITIALIZE_CREATE_TASK_FROM),
    });
  }
}

function* getTaskDetail(action: Action) {
  const { params, callback, errorCallback } = action?.payload || {};
  try {
    const { data } = yield call(() => client.get(`${URL_GET_TASK_DETAIL}/${params?.taskCode}`));
    yield put({
      type: SUCCESS(taskConstants.GET_TASK_DETAIL),
      payload: { response: { data } },
    });
    yield put({
      type: REQUEST(taskConstants.GET_TRANSACTIONS),
      payload: { params: { taskId: data?.id } },
    });
    yield put({
      type: REQUEST(taskConstants.GET_COMMENTS),
      payload: { params: { taskId: data?.id } },
    });
    yield put({
      type: REQUEST(usersConstant.GET_USERS),
      payload: { params: { organizationIds: [data?.organizationId] } },
    });
    callback?.(data);
  } catch (error) {
    errorCallback?.();
    yield put({
      type: FAILURE(taskConstants.GET_TASK_DETAIL),
      error,
    });
  }
}

function* initializeUpdateTaskForm({
  payload: {
    params: { taskCode },
  },
}: Action) {
  try {
    const [{ data: task }, { data: departments }, { data: regulationTypes }, { data: regulations }] = yield all([
      call(() => client.get(`${URL_GET_TASK_DETAIL}/${taskCode}`)),
      call(() => client.get(URL_GET_DEPARTMENTS_ALL_ROLES)),
      call(() => client.get(URL_GET_REGULATION_TYPES_ALL_ROLES)),
      call(() => client.get(URL_GET_REGULATIONS_ALL_ROLES)),
    ]);

    if (task.departmentId) {
      yield put({
        type: REQUEST(taskConstants.GET_LARGE_BUSINESS_UNITS),
        payload: {
          params: {
            departmentIds: [task.departmentId],
          },
        },
      });
    }

    if (task.majorCategoryId) {
      yield put({
        type: REQUEST(taskConstants.GET_MEDIUM_BUSINESS_UNITS),
        payload: {
          params: {
            majorCategoryIds: [task.majorCategoryId],
          },
        },
      });
    }

    if (task.middleCategoryId) {
      yield put({
        type: REQUEST(taskConstants.GET_SMALL_BUSINESS_UNITS),
        payload: {
          params: {
            middleCategoryIds: [task.middleCategoryId],
          },
        },
      });
    }

    yield put({
      type: SUCCESS(taskConstants.INITIALIZE_UPDATE_TASK_FROM),
      payload: {
        response: { task, departments, regulationTypes, regulations },
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.INITIALIZE_UPDATE_TASK_FROM),
    });
  }
}

function* getLargeBusinessUnits({ payload: { params } }: Action) {
  try {
    const { data: largeBusinessUnits } = yield call(() => client.get(URL_GET_LARGE_BUSINESS_UNIT_ALL_ROLES, { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_LARGE_BUSINESS_UNITS),
      payload: {
        response: { largeBusinessUnits },
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_LARGE_BUSINESS_UNITS),
    });
  }
}

function* getMediumBusinessUnits({ payload: { params } }: Action) {
  try {
    const { data: mediumBusinessUnits } = yield call(() => client.get(URL_GET_MEDIUM_BUSINESS_UNIT_ALL_ROLES, { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_MEDIUM_BUSINESS_UNITS),
      payload: {
        response: { mediumBusinessUnits },
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_MEDIUM_BUSINESS_UNITS),
    });
  }
}

function* getSmallBusinessUnits({ payload: { params } }: Action) {
  try {
    const { data: smallBusinessUnits } = yield call(() => client.get(URL_GET_SMALL_BUSINESS_UNIT_ALL_ROLES, { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_SMALL_BUSINESS_UNITS),
      payload: {
        response: { smallBusinessUnits },
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_SMALL_BUSINESS_UNITS),
    });
  }
}

function* bulkUpdateTasks({ payload: { params, callback, errorCallback } }: Action) {
  try {
    yield call(() => client.post(URL_BULK_UPDATE_TASKS, params));
    callback?.();
    yield put({
      type: SUCCESS(taskConstants.BULK_UPDATE_TASKS),
    });
  } catch (error) {
    errorCallback?.();
    yield put({
      type: FAILURE(taskConstants.BULK_UPDATE_TASKS),
      error,
    });
  }
}

function* createTask(action: Action) {
  const {
    payload: {
      params: { data },
      callback,
      errorCallback,
    },
  } = action;
  try {
    const response = yield call(() => client.post(URL_CREATE_TASK, data));

    callback?.(response);

    yield put({
      type: SUCCESS(taskConstants.CREATE_TASK),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(taskConstants.CREATE_TASK),
      error,
    });
  }
}

function* updateTask(action: Action) {
  const {
    payload: {
      params: { id, data },
      callback,
      errorCallback,
    },
  } = action;
  try {
    const response = yield call(() => client.patch(`${URL_UPDATE_TASK}/${id}`, data));

    callback?.(response);

    yield put({
      type: SUCCESS(taskConstants.UPDATE_TASK),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(taskConstants.UPDATE_TASK),
      error,
    });
  }
}

function* updateTaskTransaction(action: Action) {
  const {
    payload: {
      params: { taskId, id, ...data },
      callback,
      errorCallback,
    },
  } = action;
  try {
    const response = yield call(client.patch, URL_UPDATE_TASK_TRANSACTION.replace('[taskId]', taskId).replace('[id]', id), data);

    callback?.(response);

    yield put({
      type: SUCCESS(taskConstants.UPDATE_TASK_TRANSACTION),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(taskConstants.UPDATE_TASK_TRANSACTION),
      error,
    });
  }
}

function* createTaskTransaction(action: Action) {
  const {
    payload: {
      params: { taskId, ...data },
      callback,
      errorCallback,
    },
  } = action;
  try {
    const response = yield call(client.post, URL_CREATE_TASK_TRANSACTION.replace('[taskId]', taskId), data);

    callback?.(response);

    yield put({
      type: SUCCESS(taskConstants.CREATE_TASK_TRANSACTION),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(taskConstants.CREATE_TASK_TRANSACTION),
      error,
    });
  }
}

function* getTasksForBusinessUnitSearch({ payload: { params } }: Action) {
  try {
    const { data } = yield call(() => client.get(URL_GET_TASKS_FOR_BUSINESS_UNIT_SEARCH, { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_TASKS_FOR_BUSINESS_SEARCH),
      payload: { response: { data } },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_TASKS_FOR_BUSINESS_SEARCH),
    });
  }
}

function* bulkInsertTasks({ payload: { params, callback, errorCallback } }: Action) {
  try {
    const response = yield call(() => client.post(URL_BULK_INSERT_TASKS, params));

    callback?.(response);

    yield put({
      type: SUCCESS(taskConstants.BULK_INSERT_TASKS),
    });
  } catch (error) {
    errorCallback?.(error);

    yield put({
      type: FAILURE(taskConstants.BULK_INSERT_TASKS),
    });
  }
}

function* getTasksExportExcel({ payload: { params, callback } }: Action) {
  try {
    const { data } = yield call(() => client.get(URL_GET_TASKS_EXPORT_EXCEL, { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_TASKS_EXPORT_EXCEL),
      payload: { response: { tasksExportExcel: data } },
    });
    callback?.(data);
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_TASKS_EXPORT_EXCEL),
    });
  }
}

function* getTodoTasks() {
  try {
    const { data } = yield call(() => client.get(URL_GET_TODO_TASKS));
    yield put({
      type: SUCCESS(taskConstants.GET_TODO_TASKS),
      payload: {
        response: data,
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_TODO_TASKS),
    });
  }
}

function* updateTransactionProcessStatus({
  payload: {
    params: { transactionId, transactionProcessId, status },
  },
}: Action) {
  try {
    yield call(
      client.patch,
      URL_UPDATE_TASK_TRANSACTION_PROCESS_STATUS.replace('[transactionId]', transactionId).replace(
        '[transactionProcessId]',
        transactionProcessId
      ),
      { status }
    );
    yield put({
      type: SUCCESS(taskConstants.UPDATE_TRANSACTION_PROCESS_STATUS),
      payload: {
        response: { transactionId, transactionProcessId, status },
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.UPDATE_TRANSACTION_PROCESS_STATUS),
      payload: {
        response: { transactionId, transactionProcessId, status },
      },
    });
  }
}

function* getTaskCalendar(action: Action) {
  const {
    payload: { params, callback, errorCallback },
  } = action;

  const { firstCalendarParams, secondCalendarParams, thirdCalendarParams } = params;

  try {
    const groupYear = groupBy([firstCalendarParams, secondCalendarParams, thirdCalendarParams], param => param.year);
    const request = [];
    const filteredYear = [];
    Object.keys(groupYear).forEach(year => {
      const requestParams = { year, months: groupYear[year].map(o => o.month).join(',') };
      request.push(call(() => client.get(URL_GET_TASK_CALENDAR, { params: requestParams })));
      filteredYear.push(year);
    });

    const calendars = [];
    const responses = yield all(request);
    responses.forEach(({ data }, index) => {
      calendars.push(...data.map(e => ({ ...e, year: filteredYear[index] })));
    });

    yield put({
      type: SUCCESS(taskConstants.GET_TASK_CALENDAR),
      payload: { calendars },
    });

    callback?.();
  } catch (error) {
    errorCallback?.(error);
    yield put({
      type: FAILURE(taskConstants.GET_TASK_CALENDAR),
      error,
    });
  }
}

function* markTaskFavorite({
  payload: {
    params: { id },
    callback,
  },
}: Action) {
  try {
    yield call(() => client.post(URL_MARK_TASK_FAVORITE.replace('[taskId]', id)));

    yield put({
      type: SUCCESS(taskConstants.MARK_TASK_FAVORITE),
    });

    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.MARK_TASK_FAVORITE),
    });
  }
}

function* markTransactionFavorite({
  payload: {
    params: { id },
    callback,
  },
}: Action) {
  try {
    yield call(() => client.post(URL_MARK_TRANSACTION_FAVORITE.replace('[transactionId]', id)));

    yield put({
      type: SUCCESS(taskConstants.MARK_TRANSACTION_FAVORITE),
    });

    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.MARK_TRANSACTION_FAVORITE),
    });
  }
}

function* getTasksByBusiness(action: Action) {
  const { params } = action?.payload || {};
  try {
    const {
      data: { tasks = [], transactions = [] },
    } = yield call(() => client.get(URL_GET_TASK_BY_BUSINESS(params?.departmentId), { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_TASK_BY_BUSINESS),
      payload: { response: { data: [...tasks, ...transactions] } },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_TASK_BY_BUSINESS),
      error,
    });
  }
}

function* getTaskForBulkTransaction({ payload: { params, callback } }: Action) {
  try {
    const { data } = yield call(() =>
      client.get(URL_GET_TASK_FOR_REGISTER_BULK_TRANSACTION, {
        params,
      })
    );
    yield put({
      type: SUCCESS(taskConstants.GET_TASK_FOR_BULK_TRANSACTION),
      payload: { response: data },
    });
    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_TASK_FOR_BULK_TRANSACTION),
    });
  }
}

function* createBulkTransaction({ payload: { params, callback } }: Action) {
  try {
    yield call(() => client.post(URL_CREATE_TRANSACTION_BULK, params));

    yield put({
      type: SUCCESS(taskConstants.CREATE_TRANSACTION_BULK),
    });
    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.CREATE_TRANSACTION_BULK),
    });
  }
}

function* getDeadlineTasks(action: Action) {
  const { params } = action?.payload || {};
  try {
    const {
      data: { tasks = [], transactions = [] },
    } = yield call(() => client.get(URL_GET_DEADLINE_TASK, { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_DEADLINE_TASKS),
      payload: { response: { data: [...tasks, ...transactions] } },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_DEADLINE_TASKS),
      error,
    });
  }
}

function* getComments(action: Action) {
  const { params } = action?.payload || {};
  try {
    const { data } = yield call(() => client.get(URL_GET_COMMENTS(params?.taskId), { params }));
    yield put({
      type: SUCCESS(taskConstants.GET_COMMENTS),
      payload: {
        response: {
          data,
        },
      },
    });
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.GET_COMMENTS),
      error,
    });
  }
}

function* createComment(action: Action) {
  const {
    params: { taskId, ...rest },
    callback,
  } = action?.payload || {};
  try {
    const { data } = yield call(() => client.post(URL_CREATE_COMMENT(taskId), rest));

    yield put({
      type: SUCCESS(taskConstants.CREATE_COMMENT),
      payload: {
        response: { data },
      },
    });

    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.CREATE_COMMENT),
      error,
    });
  }
}

function* updateComment(action: Action) {
  const {
    params: { taskId, id, ...rest },
    callback,
    errorCallback,
  } = action?.payload || {};
  try {
    const { data } = yield call(() => client.patch(URL_UPDATE_COMMENT(taskId, id), rest));

    yield put({
      type: SUCCESS(taskConstants.UPDATE_COMMENT),
      payload: {
        response: { data },
      },
    });

    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.UPDATE_COMMENT),
      error,
    });

    errorCallback?.();
  }
}

function* deleteComment(action: Action) {
  const {
    params: { taskId, id },
    callback,
    errorCallback,
  } = action?.payload || {};
  try {
    const {
      data: { deletedAt },
    } = yield call(() => client.delete(URL_DELETE_COMMENT(taskId, id)));

    yield put({
      type: SUCCESS(taskConstants.DELETE_COMMENT),
      payload: {
        params: { id, deletedAt },
      },
    });

    callback?.();
  } catch (error) {
    yield put({
      type: FAILURE(taskConstants.DELETE_COMMENT),
      error,
    });

    errorCallback?.();
  }
}

export default function* taskSaga() {
  yield all([
    takeEvery(REQUEST(taskConstants.GET_TASKS), getTasks),
    takeEvery(REQUEST(taskConstants.INITIALIZE_CREATE_TASK_FROM), initializeCreateTaskForm),
    takeEvery(REQUEST(taskConstants.INITIALIZE_UPDATE_TASK_FROM), initializeUpdateTaskForm),
    takeEvery(REQUEST(taskConstants.GET_LARGE_BUSINESS_UNITS), getLargeBusinessUnits),
    takeEvery(REQUEST(taskConstants.GET_MEDIUM_BUSINESS_UNITS), getMediumBusinessUnits),
    takeEvery(REQUEST(taskConstants.GET_SMALL_BUSINESS_UNITS), getSmallBusinessUnits),
    takeEvery(REQUEST(taskConstants.BULK_UPDATE_TASKS), bulkUpdateTasks),
    takeEvery(REQUEST(taskConstants.CREATE_TASK), createTask),
    takeEvery(REQUEST(taskConstants.GET_TASK_DETAIL), getTaskDetail),
    takeEvery(REQUEST(taskConstants.UPDATE_TASK_TRANSACTION), updateTaskTransaction),
    takeEvery(REQUEST(taskConstants.CREATE_TASK_TRANSACTION), createTaskTransaction),
    takeLatest(REQUEST(taskConstants.GET_TASKS_FOR_BUSINESS_SEARCH), getTasksForBusinessUnitSearch),
    takeEvery(REQUEST(taskConstants.UPDATE_TASK), updateTask),
    takeEvery(REQUEST(taskConstants.BULK_INSERT_TASKS), bulkInsertTasks),
    takeLatest(REQUEST(taskConstants.GET_TASKS_EXPORT_EXCEL), getTasksExportExcel),
    takeEvery(REQUEST(taskConstants.GET_TODO_TASKS), getTodoTasks),
    takeEvery(REQUEST(taskConstants.UPDATE_TRANSACTION_PROCESS_STATUS), updateTransactionProcessStatus),
    takeEvery(REQUEST(taskConstants.GET_TASK_CALENDAR), getTaskCalendar),
    takeEvery(REQUEST(taskConstants.MARK_TASK_FAVORITE), markTaskFavorite),
    takeEvery(REQUEST(taskConstants.MARK_TRANSACTION_FAVORITE), markTransactionFavorite),
    takeEvery(REQUEST(taskConstants.GET_TASK_BY_BUSINESS), getTasksByBusiness),
    takeEvery(REQUEST(taskConstants.GET_TRANSACTIONS), getTransactions),
    takeEvery(REQUEST(taskConstants.GET_TASK_FOR_BULK_TRANSACTION), getTaskForBulkTransaction),
    takeEvery(REQUEST(taskConstants.CREATE_TRANSACTION_BULK), createBulkTransaction),
    takeEvery(REQUEST(taskConstants.GET_DEADLINE_TASKS), getDeadlineTasks),
    takeEvery(REQUEST(taskConstants.GET_COMMENTS), getComments),
    takeEvery(REQUEST(taskConstants.CREATE_COMMENT), createComment),
    takeEvery(REQUEST(taskConstants.UPDATE_COMMENT), updateComment),
    takeEvery(REQUEST(taskConstants.DELETE_COMMENT), deleteComment),
  ]);
}
