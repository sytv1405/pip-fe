import { transform } from 'lodash';

import { Action } from '@/types';

import { taskConstants } from '../constants/task';
import { FAILURE, REQUEST, SUCCESS } from '../constants';

const initialState = {
  isLoading: false,
  isSubmitting: false,
  isLargeBusinessUnitsLoading: false,
  isMediumBusinessUnitsLoading: false,
  isSmallBusinessUnitsLoading: false,
  isRegulationsLoading: false,
  isCreateUpdateLoading: false,
  isBulkInsertLoading: false,
  isTodoTasksLoading: false,
  isSearchCriteriaOpen: false,
  isCommentSubmitting: false,
  isCommentDeleting: false,
  task: {},
  tasks: [],
  transactions: [],
  comments: [],
  meta: { count: 0, totalTaskOfOrg: 0 },
  departments: [],
  largeBusinessUnits: [],
  mediumBusinessUnits: [],
  smallBusinessUnits: [],
  regulationTypes: [],
  regulations: [],
  selectedTaskIds: [],
  searchState: {},
  taskDetail: {},
  form: {},
  tasksForBusinessUnitSearch: [],
  todoTasks: {
    transactionsOfUser: [],
    transactionsOtherUsers: [],
    tasks: [],
  },
  transactionProcessLoading: {},
  calendars: [],
  businessTasks: [],
  taskForBulkTransaction: [],
  filterState: {
    filterByFavorite: false,
    filterByDepartment: false,
    filterCompletedTask: false,
  },
};

const reducer = (state = initialState, action: Action): typeof initialState => {
  const { payload } = action;
  const { data, meta } = payload?.response || {};
  const { selectedTaskIds, searchState } = payload?.params || {};

  switch (action.type) {
    case taskConstants.CLEAR_TASK_FORM:
      return initialState;
    case taskConstants.SET_FORM_STATE:
      return {
        ...state,
        form: payload.params.form,
      };
    case REQUEST(taskConstants.GET_TASKS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_TASKS):
      return {
        ...state,
        isLoading: false,
        tasks: data,
        meta,
      };
    case FAILURE(taskConstants.GET_TASKS):
      return {
        ...state,
        isLoading: false,
        meta: initialState.meta,
        tasks: [],
      };
    case REQUEST(taskConstants.GET_TRANSACTIONS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_TRANSACTIONS):
      return {
        ...state,
        isLoading: false,
        transactions: data,
        meta,
      };
    case FAILURE(taskConstants.GET_TRANSACTIONS):
      return {
        ...state,
        isLoading: false,
        meta: initialState.meta,
        transactions: [],
      };
    case REQUEST(taskConstants.GET_TASKS_FOR_BUSINESS_SEARCH):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_TASKS_FOR_BUSINESS_SEARCH):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(taskConstants.GET_TASKS_FOR_BUSINESS_SEARCH):
      return {
        ...state,
        isLoading: false,
        tasksForBusinessUnitSearch: [],
      };
    case REQUEST(taskConstants.INITIALIZE_CREATE_TASK_FROM):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.INITIALIZE_CREATE_TASK_FROM):
      return {
        ...state,
        ...payload.response,
        isLoading: false,
      };
    case FAILURE(taskConstants.INITIALIZE_CREATE_TASK_FROM):
      return {
        ...state,
        isLoading: false,
      };
    case REQUEST(taskConstants.INITIALIZE_UPDATE_TASK_FROM):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.INITIALIZE_UPDATE_TASK_FROM):
      return {
        ...state,
        ...payload.response,
        isLoading: false,
      };
    case FAILURE(taskConstants.INITIALIZE_UPDATE_TASK_FROM):
      return {
        ...state,
        isLoading: false,
      };
    case REQUEST(taskConstants.GET_LARGE_BUSINESS_UNITS):
      return {
        ...state,
        isLargeBusinessUnitsLoading: true,
        largeBusinessUnits: [],
        mediumBusinessUnits: [],
        smallBusinessUnits: [],
      };
    case SUCCESS(taskConstants.GET_LARGE_BUSINESS_UNITS):
      return {
        ...state,
        ...payload.response,
        isLargeBusinessUnitsLoading: false,
      };
    case FAILURE(taskConstants.GET_LARGE_BUSINESS_UNITS):
      return {
        ...state,
        isLargeBusinessUnitsLoading: false,
      };
    case taskConstants.CLEAR_LARGE_BUSINESS_UNITS:
      return {
        ...state,
        largeBusinessUnits: [],
      };
    case taskConstants.CLEAR_MEDIUM_BUSINESS_UNITS:
      return {
        ...state,
        mediumBusinessUnits: [],
      };
    case taskConstants.CLEAR_SMALL_BUSINESS_UNITS:
      return {
        ...state,
        smallBusinessUnits: [],
      };
    case REQUEST(taskConstants.GET_MEDIUM_BUSINESS_UNITS):
      return {
        ...state,
        isMediumBusinessUnitsLoading: true,
        mediumBusinessUnits: [],
        smallBusinessUnits: [],
      };
    case SUCCESS(taskConstants.GET_MEDIUM_BUSINESS_UNITS):
      return {
        ...state,
        ...payload.response,
        isMediumBusinessUnitsLoading: false,
      };
    case FAILURE(taskConstants.GET_MEDIUM_BUSINESS_UNITS):
      return {
        ...state,
        isMediumBusinessUnitsLoading: false,
      };
    case REQUEST(taskConstants.GET_SMALL_BUSINESS_UNITS):
      return {
        ...state,
        isSmallBusinessUnitsLoading: true,
        smallBusinessUnits: [],
      };
    case SUCCESS(taskConstants.GET_SMALL_BUSINESS_UNITS):
      return {
        ...state,
        ...payload.response,
        isSmallBusinessUnitsLoading: false,
      };
    case FAILURE(taskConstants.GET_SMALL_BUSINESS_UNITS):
      return {
        ...state,
        isSmallBusinessUnitsLoading: false,
      };
    case REQUEST(taskConstants.CREATE_TASK):
      return {
        ...state,
        isCreateUpdateLoading: true,
      };
    case SUCCESS(taskConstants.CREATE_TASK):
      return {
        ...state,
        isCreateUpdateLoading: false,
      };
    case FAILURE(taskConstants.CREATE_TASK):
      return {
        ...state,
        isCreateUpdateLoading: false,
      };
    case REQUEST(taskConstants.UPDATE_TASK):
      return {
        ...state,
        isCreateUpdateLoading: true,
      };
    case SUCCESS(taskConstants.UPDATE_TASK):
      return {
        ...state,
        isCreateUpdateLoading: false,
      };
    case FAILURE(taskConstants.UPDATE_TASK):
      return {
        ...state,
        isCreateUpdateLoading: false,
      };
    case REQUEST(taskConstants.BULK_UPDATE_TASKS):
      return {
        ...state,
        isSubmitting: true,
      };
    case SUCCESS(taskConstants.BULK_UPDATE_TASKS):
    case FAILURE(taskConstants.BULK_UPDATE_TASKS):
      return {
        ...state,
        isSubmitting: false,
      };
    case REQUEST(taskConstants.SET_SELECTED_TASKS):
      return {
        ...state,
        selectedTaskIds,
      };
    case REQUEST(taskConstants.SET_SEARCH_TASK_STATE):
      return {
        ...state,
        searchState,
      };

    case REQUEST(taskConstants.GET_TASK_DETAIL):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_TASK_DETAIL):
      return {
        ...state,
        isLoading: false,
        taskDetail: data,
      };
    case FAILURE(taskConstants.GET_TASK_DETAIL):
      return {
        ...state,
        isLoading: false,
        taskDetail: {},
      };
    case REQUEST(taskConstants.UPDATE_TASK_TRANSACTION):
      return {
        ...state,
        isSubmitting: true,
      };
    case SUCCESS(taskConstants.UPDATE_TASK_TRANSACTION):
    case FAILURE(taskConstants.UPDATE_TASK_TRANSACTION):
      return {
        ...state,
        isSubmitting: false,
      };
    case REQUEST(taskConstants.CREATE_TASK_TRANSACTION):
      return {
        ...state,
        isSubmitting: true,
      };
    case SUCCESS(taskConstants.CREATE_TASK_TRANSACTION):
    case FAILURE(taskConstants.CREATE_TASK_TRANSACTION):
      return {
        ...state,
        isSubmitting: false,
      };
    case REQUEST(taskConstants.BULK_INSERT_TASKS):
      return {
        ...state,
        isBulkInsertLoading: true,
      };
    case SUCCESS(taskConstants.BULK_INSERT_TASKS):
    case FAILURE(taskConstants.BULK_INSERT_TASKS):
      return {
        ...state,
        isBulkInsertLoading: false,
      };
    case REQUEST(taskConstants.GET_TASKS_EXPORT_EXCEL):
      return {
        ...state,
        isSubmitting: true,
      };
    case SUCCESS(taskConstants.GET_TASKS_EXPORT_EXCEL):
    case FAILURE(taskConstants.GET_TASKS_EXPORT_EXCEL):
      return {
        ...state,
        isSubmitting: false,
      };
    case REQUEST(taskConstants.GET_TODO_TASKS):
      return {
        ...state,
        isTodoTasksLoading: true,
      };
    case SUCCESS(taskConstants.GET_TODO_TASKS):
      return {
        ...state,
        isTodoTasksLoading: false,
        todoTasks: payload?.response,
      };
    case FAILURE(taskConstants.GET_TODO_TASKS):
      return {
        ...state,
        isTodoTasksLoading: false,
        todoTasks: initialState.todoTasks,
      };
    case REQUEST(taskConstants.UPDATE_TRANSACTION_PROCESS_STATUS): {
      const { transactionId, transactionProcessId } = payload.params || {};
      const { transactions = [] } = state;
      return {
        ...state,
        transactionProcessLoading: { ...state.transactionProcessLoading, [transactionProcessId]: true },
        transactions: [
          ...transactions.map(transaction =>
            transaction.id === transactionId
              ? {
                  ...transaction,
                  transactionProcesses: transaction?.transactionProcesses?.map(process =>
                    process.id === transactionProcessId ? { ...process, status: !process.status } : process
                  ),
                }
              : transaction
          ),
        ],
      };
    }
    case SUCCESS(taskConstants.UPDATE_TRANSACTION_PROCESS_STATUS): {
      const { transactionProcessId } = payload.response || {};
      return {
        ...state,
        transactionProcessLoading: { ...state.transactionProcessLoading, [transactionProcessId]: false },
      };
    }
    case FAILURE(taskConstants.UPDATE_TRANSACTION_PROCESS_STATUS): {
      const { transactionProcessId } = payload.response || {};
      return {
        ...state,
        transactionProcessLoading: { ...state.transactionProcessLoading, [transactionProcessId]: false },
      };
    }

    case REQUEST(taskConstants.GET_TASK_CALENDAR):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_TASK_CALENDAR):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(taskConstants.GET_TASK_CALENDAR):
      return {
        ...state,
        isLoading: false,
        calendars: [],
      };
    case REQUEST(taskConstants.GET_TASK_BY_BUSINESS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_TASK_BY_BUSINESS):
      return {
        ...state,
        isLoading: false,
        businessTasks: data,
      };
    case FAILURE(taskConstants.GET_TASK_BY_BUSINESS):
      return {
        ...state,
        isLoading: false,
        businessTasks: [],
      };
    case REQUEST(taskConstants.GET_DEADLINE_TASKS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_DEADLINE_TASKS):
      return {
        ...state,
        isLoading: false,
        businessTasks: data,
      };
    case FAILURE(taskConstants.GET_DEADLINE_TASKS):
      return {
        ...state,
        isLoading: false,
        businessTasks: [],
      };
    case REQUEST(taskConstants.GET_TASK_FOR_BULK_TRANSACTION):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_TASK_FOR_BULK_TRANSACTION):
      return {
        ...state,
        isLoading: false,
        taskForBulkTransaction: payload?.response,
      };
    case FAILURE(taskConstants.GET_TASK_FOR_BULK_TRANSACTION):
      return {
        ...state,
        isLoading: false,
        taskForBulkTransaction: [],
      };
    case REQUEST(taskConstants.CREATE_TRANSACTION_BULK):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.CREATE_TRANSACTION_BULK):
      return {
        ...state,
        isLoading: false,
        ...payload,
      };
    case FAILURE(taskConstants.CREATE_TRANSACTION_BULK):
      return {
        ...state,
        isLoading: false,
      };
    case REQUEST(taskConstants.GET_COMMENTS):
      return {
        ...state,
        isLoading: true,
      };
    case SUCCESS(taskConstants.GET_COMMENTS):
      return {
        ...state,
        isLoading: false,
        comments: data,
      };
    case FAILURE(taskConstants.GET_COMMENTS):
      return {
        ...state,
        isLoading: false,
        comments: [],
      };
    case REQUEST(taskConstants.CREATE_COMMENT):
    case REQUEST(taskConstants.UPDATE_COMMENT):
      return {
        ...state,
        isCommentSubmitting: true,
      };
    case SUCCESS(taskConstants.CREATE_COMMENT):
      return {
        ...state,
        isCommentSubmitting: false,
        comments: [payload.response.data, ...state.comments],
      };
    case SUCCESS(taskConstants.UPDATE_COMMENT):
      return {
        ...state,
        isCommentSubmitting: false,
        comments: transform(
          state.comments,
          (acc, record) => {
            acc.push(
              record.id === payload.response.data.id
                ? {
                    ...record,
                    ...payload.response.data,
                  }
                : record
            );
          },
          []
        ),
      };
    case FAILURE(taskConstants.CREATE_COMMENT):
    case FAILURE(taskConstants.UPDATE_COMMENT):
      return {
        ...state,
        isCommentSubmitting: false,
      };
    case REQUEST(taskConstants.DELETE_COMMENT):
      return {
        ...state,
        isCommentDeleting: true,
      };
    case SUCCESS(taskConstants.DELETE_COMMENT):
      return {
        ...state,
        isCommentDeleting: false,
        comments: transform(
          state.comments,
          (acc, record) => {
            acc.push(
              record.id === payload.params.id
                ? {
                    ...record,
                    ...payload.params,
                  }
                : record
            );
          },
          []
        ),
      };
    case FAILURE(taskConstants.DELETE_COMMENT):
      return {
        ...state,
        isCommentDeleting: false,
      };
    case taskConstants.UPDATE_FAVORITE_STATE: {
      const { transactionId, taskId } = payload.params || {};
      return {
        ...state,
        businessTasks: [
          ...(state.businessTasks || []).map(taskOrTransaction => {
            const { favoriteTransactions, favoriteTasks } = taskOrTransaction;
            if ('task' in taskOrTransaction) {
              return taskOrTransaction.id === transactionId
                ? { ...taskOrTransaction, favoriteTransactions: favoriteTransactions?.length ? [] : [{ id: Date.now(), transactionId }] }
                : taskOrTransaction;
            }

            return taskOrTransaction.id === taskId
              ? { ...taskOrTransaction, favoriteTasks: favoriteTasks?.length ? [] : [{ id: Date.now(), taskId }] }
              : taskOrTransaction;
          }),
        ],
      };
    }
    case taskConstants.UPDATE_FAVORITE_TODO_STATE: {
      const { transactionId, taskId } = payload.params || {};
      const { transactionsOfUser = [], transactionsOtherUsers = [], tasks = [] } = state.todoTasks || {};

      if (transactionId) {
        return {
          ...state,
          todoTasks: {
            ...state.todoTasks,
            transactionsOfUser: [
              ...transactionsOfUser.map(transaction =>
                transaction.id === transactionId
                  ? {
                      ...transaction,
                      favoriteTransactions: transaction.favoriteTransactions?.length ? [] : [{ id: Date.now(), transactionId }],
                    }
                  : transaction
              ),
            ],
            transactionsOtherUsers: [
              ...transactionsOtherUsers.map(transaction =>
                transaction.id === transactionId
                  ? {
                      ...transaction,
                      favoriteTransactions: transaction.favoriteTransactions?.length ? [] : [{ id: Date.now(), transactionId }],
                    }
                  : transaction
              ),
            ],
          },
        };
      }

      return {
        ...state,
        todoTasks: {
          ...state.todoTasks,
          tasks: [
            ...tasks.map(task =>
              task.id === taskId ? { ...task, favoriteTasks: task.favoriteTasks?.length ? [] : [{ id: Date.now(), taskId }] } : task
            ),
          ],
        },
      };
    }
    case taskConstants.UPDATE_SEARCH_COLLAPSE_STATE: {
      const { isSearchCriteriaOpen } = payload.params;
      return {
        ...state,
        isSearchCriteriaOpen,
      };
    }
    case taskConstants.SET_FILTER_TASKS_STATE:
      return {
        ...state,
        filterState: {
          ...state.filterState,
          ...payload.params,
        },
      };
    case taskConstants.CLEAN_BUSINESS_TASKS_DATA:
      return {
        ...state,
        businessTasks: [],
      };
    default:
      return state;
  }
};

export default reducer;
