import { Payload } from '@/types';

import { REQUEST, taskConstants } from '../constants';

export const getTasks = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_TASKS),
  payload,
});

export const initializeCreateTaskForm = () => ({
  type: REQUEST(taskConstants.INITIALIZE_CREATE_TASK_FROM),
});

export const initializeUpdateTaskForm = (payload: Payload) => ({
  type: REQUEST(taskConstants.INITIALIZE_UPDATE_TASK_FROM),
  payload,
});

export const clearTaskForm = () => ({
  type: taskConstants.CLEAR_TASK_FORM,
});

export const setFormState = (payload: Payload) => ({
  type: taskConstants.SET_FORM_STATE,
  payload,
});

export const getTaskLargeBusinessUnits = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_LARGE_BUSINESS_UNITS),
  payload,
});

export const getTaskMediumBusinessUnits = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_MEDIUM_BUSINESS_UNITS),
  payload,
});

export const getTaskSmallBusinessUnits = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_SMALL_BUSINESS_UNITS),
  payload,
});

export const clearTaskLargeBusinessUnits = () => ({
  type: taskConstants.CLEAR_LARGE_BUSINESS_UNITS,
});

export const clearTaskMediumBusinessUnits = () => ({
  type: taskConstants.CLEAR_MEDIUM_BUSINESS_UNITS,
});

export const clearTaskSmallBusinessUnits = () => ({
  type: taskConstants.CLEAR_SMALL_BUSINESS_UNITS,
});

export const bulkUpdateTask = (payload: Payload) => ({
  type: REQUEST(taskConstants.BULK_UPDATE_TASKS),
  payload,
});

export const setSelectedTasks = (payload: Payload) => ({
  type: REQUEST(taskConstants.SET_SELECTED_TASKS),
  payload,
});

export const setSearchTaskState = (payload: Payload) => ({
  type: REQUEST(taskConstants.SET_SEARCH_TASK_STATE),
  payload,
});

export const createTask = (payload: Payload) => ({
  type: REQUEST(taskConstants.CREATE_TASK),
  payload,
});

export const getTaskDetail = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_TASK_DETAIL),
  payload,
});

export const getTasksForBusinessUnitSearch = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_TASKS_FOR_BUSINESS_SEARCH),
  payload,
});

export const updateTaskTransaction = (payload: Payload) => ({
  type: REQUEST(taskConstants.UPDATE_TASK_TRANSACTION),
  payload,
});

export const createTaskTransaction = (payload: Payload) => ({
  type: REQUEST(taskConstants.CREATE_TASK_TRANSACTION),
  payload,
});

export const updateTask = (payload: Payload) => ({
  type: REQUEST(taskConstants.UPDATE_TASK),
  payload,
});

export const getTaskCalendar = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_TASK_CALENDAR),
  payload,
});

export const bulkInsertTasks = (payload: Payload) => ({
  type: REQUEST(taskConstants.BULK_INSERT_TASKS),
  payload,
});

export const getTasksExportExcel = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_TASKS_EXPORT_EXCEL),
  payload,
});

export const getTodoTasks = () => ({
  type: REQUEST(taskConstants.GET_TODO_TASKS),
});

export const updateTransactionProcessStatus = (payload: Payload) => ({
  type: REQUEST(taskConstants.UPDATE_TRANSACTION_PROCESS_STATUS),
  payload,
});

export const markTaskFavorite = (payload: Payload) => ({
  type: REQUEST(taskConstants.MARK_TASK_FAVORITE),
  payload,
});

export const markTransactionFavorite = (payload: Payload) => ({
  type: REQUEST(taskConstants.MARK_TRANSACTION_FAVORITE),
  payload,
});

export const getTasksByBusiness = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_TASK_BY_BUSINESS),
  payload,
});

export const updateFavoriteState = (payload: Payload) => ({
  type: taskConstants.UPDATE_FAVORITE_STATE,
  payload,
});

export const getTransactions = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_TRANSACTIONS),
  payload,
});

export const getTaskForBulkTransaction = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_TASK_FOR_BULK_TRANSACTION),
  payload,
});

export const createBulkTransaction = (payload: Payload) => ({
  type: REQUEST(taskConstants.CREATE_TRANSACTION_BULK),
  payload,
});

export const updateFavoriteTodoState = (payload: Payload) => ({
  type: taskConstants.UPDATE_FAVORITE_TODO_STATE,
  payload,
});

export const getDeadlineTasks = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_DEADLINE_TASKS),
  payload,
});

export const updateSearchCollapseState = (payload: Payload) => ({
  type: taskConstants.UPDATE_SEARCH_COLLAPSE_STATE,
  payload,
});

export const setFilterTasksState = (payload: Payload) => ({
  type: taskConstants.SET_FILTER_TASKS_STATE,
  payload,
});

export const cleanBusinessTasksData = () => ({
  type: taskConstants.CLEAN_BUSINESS_TASKS_DATA,
});

export const getComments = (payload: Payload) => ({
  type: REQUEST(taskConstants.GET_COMMENTS),
  payload,
});

export const createComment = (payload: Payload) => ({
  type: REQUEST(taskConstants.CREATE_COMMENT),
  payload,
});

export const updateComment = (payload: Payload) => ({
  type: REQUEST(taskConstants.UPDATE_COMMENT),
  payload,
});

export const deleteComment = (payload: Payload) => ({
  type: REQUEST(taskConstants.DELETE_COMMENT),
  payload,
});
