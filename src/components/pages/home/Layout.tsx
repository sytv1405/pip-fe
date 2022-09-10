import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Checkbox, Col, Row, Typography, Grid, Collapse } from 'antd';
import moment from 'moment';
import { connect, ConnectedProps } from 'react-redux';
import classNames from 'classnames';

import { TaskCalendar } from '@/components/pages/home/TaskCalendar';
import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { RootState } from '@/redux/rootReducer';
import { Payload, Task, Transaction } from '@/types';
import { getTaskCalendar, getTodoTasks, updateFavoriteTodoState } from '@/redux/actions';
import LoadingScreen from '@/components/LoadingScreen';
import { dateFormat } from '@/shared/constants';
import { convertToDateJP } from '@/shared/calendar';
import { TaskStatus } from '@/shared/enum';
import { CalendarIcon, CalendarBackIcon, CalendarForwardIcon, FileIcon, CollapseUpIcon, CollapseDownIcon } from '@/assets/images';
import { SectionTitle } from '@/components/Typography';
import { Spacer } from '@/components/Spacer';
import TransactionTaskTable from '@/components/TransactionTaskTable';
import { paths } from '@/shared/paths';
import { getHomeFilterParams, setHomeFilterParams } from '@/utils/storage';

import { taskPeriodTypes, transactionStatuses, TRANSACTION_ON_CALENDAR_STATUSES } from '../tasks/constants';

import styles from './styles.module.scss';
import TaskDetailModal from './modal/TaskDetailModal';
import TransactionDetailModal from './modal/TransactionDetailModal';
import CompleteTransactionModal from './modal/CompleteTransactionModal';

const { useBreakpoint } = Grid;

const Layout = ({
  isTodoTasksLoading,
  todoTasks,
  user,
  taskLoading,
  completeTaskSubmitting,
  calendars,
  dispatchGetTaskCalendar,
  dispatchGetTodoTasks,
  dispatchUpdateFavoriteTodoState,
}: PropsFromRedux) => {
  const [t] = useTranslation(['home']);
  const [currentDate, setCurrentDate] = useState<moment.Moment>(moment());
  const [isTaskTodoDetailsPopupShow, setIsTaskTodoDetailsPopupShow] = useState<boolean>(false);
  const [isOpenTransactionInfor, setOpenTransactionInfor] = useState<boolean>(false);
  const [isOpenCompleteTransactionModal, setOpenCompleteTransactionModal] = useState<boolean>(false);
  const [taskDetail, setTaskDetail] = useState({});

  const { filterCompletedTask, filterByDepartment, filterByFavorite } = useMemo(() => getHomeFilterParams(), []);

  const [showCompletedTask, setShowCompletedTask] = useState<boolean>(filterCompletedTask);
  const [showDepartmentTask, setShowDepartmentTask] = useState<boolean>(filterByDepartment);
  const [showFavorite, setShowFavorite] = useState<boolean>(filterByFavorite);
  const screens = useBreakpoint();

  const mapCalendar = useCallback(
    (calendarData, monthInYear: number, year: number) => {
      const calendarEvents = [];
      const taskNoTransaction = {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        status: TaskStatus.TODO,
      };
      (calendarData || [])
        .filter(o => +o.month === monthInYear && +o.year === year)
        .forEach(({ tasks, transactions }) => {
          tasks?.forEach(task => {
            const isTaskHasAssignOrOutOfDepartment =
              showDepartmentTask && (task.departmentId !== user?.departmentId || task.taskTransactions?.length);

            if (isTaskHasAssignOrOutOfDepartment) {
              return;
            }

            task.periods.forEach(({ startOfPeriod, endOfPeriod }) => {
              if (moment(task.createdAt).diff(endOfPeriod, 'day') > 0) return;

              const addition =
                (task.periodType === taskPeriodTypes.specified && task.leadTimeDay === 0) ||
                moment(startOfPeriod)?.isSame(endOfPeriod, 'day')
                  ? 0
                  : 1;
              const end = endOfPeriod ? moment(endOfPeriod).utc(true) : null;
              const start = addition ? moment(startOfPeriod).utc(true) : end;
              calendarEvents.push({
                ...taskNoTransaction,
                title: task.title,
                start: start?.format(dateFormat),
                end: end?.clone()?.add(addition, 'day')?.format(dateFormat),
                extendedProps: {
                  taskCode: task.taskCode,
                  id: task.id,
                  start: start?.format(dateFormat),
                  end: end?.format(dateFormat),
                  status: TaskStatus.TODO,
                  title: task.title,
                },
              });
            });
          });

          transactions?.forEach(transaction => {
            const isCompletedTransaction = !showCompletedTask && transaction.status === transactionStatuses.completed;
            const isTransactionAssignOtherDepartment = showDepartmentTask && transaction.owner?.departmentId !== user?.departmentId;
            const isTransactionOfOther = !showDepartmentTask && transaction.owner?.id !== user?.id;

            if (isCompletedTransaction || isTransactionAssignOtherDepartment || isTransactionOfOther) {
              return;
            }

            const startDate = transaction?.startDate && moment(transaction.startDate).utc(true);
            const endDate = transaction?.completionDate && moment(transaction.completionDate).utc(true);
            const addition = startDate?.isSame(endDate, 'day') ? 0 : 1;
            calendarEvents.push({
              ...taskNoTransaction,
              title: transaction?.title,
              start: startDate?.format(dateFormat),
              end: endDate?.clone()?.add(addition, 'day')?.format(dateFormat),
              status: TRANSACTION_ON_CALENDAR_STATUSES[transaction.status],
              extendedProps: {
                task: {
                  taskCode: transaction?.task?.taskCode,
                  id: transaction?.task?.id,
                  title: transaction?.task?.title,
                },
                totalTransactions: transaction?.transactionProcesses?.length,
                numberOfCompleted: transaction?.transactionProcesses?.filter(item => item.status)?.length,
                transaction,
                start: startDate?.format(dateFormat),
                end: endDate?.format(dateFormat),
                status: TRANSACTION_ON_CALENDAR_STATUSES[transaction.status],
              },
            });
          });
        });

      return calendarEvents;
    },
    [showCompletedTask, showDepartmentTask, user]
  );

  const viewTaskDetail = useCallback(
    ({ event: { extendedProps: task } }) => {
      setTaskDetail(task);
      if (task.status === TaskStatus.TODO) {
        setIsTaskTodoDetailsPopupShow(true);
      }

      if ([TaskStatus.OPEN, TaskStatus.DOING, TaskStatus.COMPLETED].includes(task.status)) {
        setOpenTransactionInfor(true);
      }
    },
    [setTaskDetail, setIsTaskTodoDetailsPopupShow, setOpenTransactionInfor]
  );

  const getAllTaskCalendar = useCallback(() => {
    dispatchGetTaskCalendar({
      params: {
        firstCalendarParams: {
          month: currentDate.clone().month() + 1,
          year: currentDate.clone().year(),
        },
        secondCalendarParams: {
          month: currentDate.clone().add(1, 'month').month() + 1,
          year: currentDate.clone().add(1, 'month').year(),
        },
        thirdCalendarParams: {
          month: currentDate.clone().add(2, 'month').month() + 1,
          year: currentDate.clone().add(2, 'month').year(),
        },
      },
    });
  }, [currentDate, dispatchGetTaskCalendar]);

  const filterCompletedTransaction = useCallback(
    ({ target: { checked } }) => {
      setShowCompletedTask(checked);
      setHomeFilterParams({ ...getHomeFilterParams(), filterCompletedTask: checked });
    },
    [setShowCompletedTask]
  );

  const filterDepartmentTask = useCallback(
    ({ target: { checked } }) => {
      setShowDepartmentTask(checked);
      setHomeFilterParams({ ...getHomeFilterParams(), filterByDepartment: checked });
    },
    [setShowDepartmentTask]
  );

  const filterFavorite = useCallback(
    ({ target: { checked } }) => {
      setShowFavorite(checked);
      setHomeFilterParams({ ...getHomeFilterParams(), filterByFavorite: checked });
    },
    [setShowFavorite]
  );

  const filterFavoriteResource = useCallback(
    (resources: Task[] | Transaction[]) =>
      showFavorite
        ? (resources as any)?.filter(element => element.favoriteTasks?.length || element.favoriteTransactions?.length)
        : resources,
    [showFavorite]
  );

  const firstCalendarData = useMemo(() => {
    return mapCalendar(calendars, currentDate.clone().month() + 1, currentDate.clone().year());
  }, [currentDate, mapCalendar, calendars]);

  const secondCalendarData = useMemo(() => {
    return mapCalendar(calendars, currentDate.clone().add(1, 'month').month() + 1, currentDate.clone().add(1, 'month').year());
  }, [currentDate, mapCalendar, calendars]);

  const thirdCalendarData = useMemo(() => {
    return mapCalendar(calendars, currentDate.clone().add(2, 'month').month() + 1, currentDate.clone().add(2, 'month').year());
  }, [currentDate, mapCalendar, calendars]);

  const tasksOfOther = useMemo(() => [...(todoTasks?.transactionsOtherUsers || []), ...(todoTasks?.tasks || [])], [todoTasks]);

  useEffect(() => {
    getAllTaskCalendar();
  }, [getAllTaskCalendar]);

  useEffect(() => {
    dispatchGetTodoTasks();
  }, [dispatchGetTodoTasks]);

  return (
    <WithAuth title={t('home_title')} isContentFullWidth>
      {(isTodoTasksLoading || taskLoading || completeTaskSubmitting) && <LoadingScreen />}
      <div className={classNames(styles['todo-list'])}>
        <Row className={styles['mobile-padding']} justify="space-between" align="middle">
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 11 }} className={styles['header--left']}>
            <SectionTitle level={3} icon={<FileIcon />}>
              {t('home_task')}
            </SectionTitle>
          </Col>
          <Col
            xs={{ span: 24 }}
            sm={{ span: 9, offset: 15 }}
            md={{ span: 12, offset: 12 }}
            lg={{ span: 12, offset: 0 }}
            className="text-right mb-2"
          >
            <Checkbox
              onChange={filterFavorite}
              defaultChecked={showFavorite}
              className={classNames(styles['checkbox-show-favorite-tasks'], 'text-nowrap')}
            >
              {t('show_favorite_tasks')}
            </Checkbox>
          </Col>
        </Row>
        <Card className="border-none">
          <>
            <div className={classNames(styles['data-section'], 'mb-4')}>
              <Collapse
                defaultActiveKey="myTodo"
                ghost
                expandIconPosition="right"
                expandIcon={({ isActive }) => (isActive ? <CollapseUpIcon /> : <CollapseDownIcon />)}
              >
                <Collapse.Panel
                  key="myTodo"
                  header={
                    <>
                      <Typography.Text ellipsis={true} strong className={classNames(styles.title, 'mr-3', 'text-nowrap')}>
                        {t('task_performed_by', { name: user.name })}
                      </Typography.Text>
                      <Typography.Text>
                        {showFavorite
                          ? t('common:favorite_count', { count: filterFavoriteResource(todoTasks?.transactionsOfUser)?.length || 0 })
                          : t('common:case', { count: todoTasks?.transactionsOfUser?.length || 0 })}
                      </Typography.Text>
                    </>
                  }
                >
                  <TransactionTaskTable
                    transactions={filterFavoriteResource(todoTasks?.transactionsOfUser)}
                    onStarCallback={dispatchUpdateFavoriteTodoState}
                    updateTransactionCallback={dispatchGetTodoTasks}
                    backUrl={paths.home}
                    isFavorite={showFavorite}
                  />
                </Collapse.Panel>
              </Collapse>
            </div>
            <div className={styles['data-section']}>
              <Collapse
                defaultActiveKey="otherUserTodo"
                ghost
                expandIconPosition="right"
                expandIcon={({ isActive }) => (isActive ? <CollapseUpIcon /> : <CollapseDownIcon />)}
              >
                <Collapse.Panel
                  key="otherUserTodo"
                  header={
                    <>
                      <Typography.Text ellipsis={true} strong className={classNames(styles.title, 'mr-3', 'text-nowrap')}>
                        {t('home_sub_2')}
                      </Typography.Text>
                      <Typography.Text>
                        {showFavorite
                          ? t('common:favorite_count', {
                              count: filterFavoriteResource(tasksOfOther)?.length || 0,
                            })
                          : t('common:case', {
                              count: tasksOfOther?.length || 0,
                            })}
                      </Typography.Text>
                    </>
                  }
                >
                  <TransactionTaskTable
                    transactions={filterFavoriteResource(tasksOfOther)}
                    onStarCallback={dispatchUpdateFavoriteTodoState}
                    updateTransactionCallback={dispatchGetTodoTasks}
                    backUrl={paths.home}
                    isFavorite={showFavorite}
                  />
                </Collapse.Panel>
              </Collapse>
            </div>
          </>
        </Card>
      </div>
      <Spacer height="40px" />
      {screens.md && (
        <div className={styles['task--calendar']}>
          <div className={classNames(styles.header)}>
            <SectionTitle icon={<CalendarIcon />} level={3}>
              {t('work_calendar')}
            </SectionTitle>
          </div>
          <Card className="border-none">
            <div className="mb-5">
              <Row className={styles['filter-checkbox__calendar']}>
                <Col span={24} className="text-right">
                  <Checkbox defaultChecked={showDepartmentTask} onChange={filterDepartmentTask}>
                    {t('show_department_task')}
                  </Checkbox>
                  <Checkbox defaultChecked={showCompletedTask} onChange={filterCompletedTransaction}>
                    {t('show_task_done')}
                  </Checkbox>
                </Col>
              </Row>
              <Row justify="space-between" align="middle">
                <Col span={10}>
                  <Row className="d-flex a">
                    <Typography.Title level={4} className={classNames(styles['calendar-title'], 'mr-5')}>
                      {convertToDateJP(currentDate.clone().startOf('month').format(dateFormat), 'yearMonth')}
                    </Typography.Title>
                    <div className="btn-next-month mt-1">
                      <CalendarBackIcon
                        onClick={() => setCurrentDate(previous => previous.clone().subtract(1, 'month'))}
                        className="mr-1 cursor-pointer"
                      />
                      <CalendarForwardIcon
                        className="cursor-pointer"
                        onClick={() => setCurrentDate(previous => previous.clone().add(1, 'month'))}
                      />
                    </div>
                  </Row>
                </Col>
              </Row>
              <TaskCalendar
                onClickEvent={viewTaskDetail}
                validRange={{
                  start: currentDate.clone().startOf('month').format(dateFormat),
                  end: currentDate.clone().endOf('month').add(1, 'day').format(dateFormat),
                }}
                events={firstCalendarData}
              />
            </div>
            <div className="mb-5">
              <Typography.Title level={4} className={classNames(styles['calendar-title'])}>
                {convertToDateJP(currentDate.clone().add(1, 'month').startOf('month').format(dateFormat), 'yearMonth')}
              </Typography.Title>
              <TaskCalendar
                onClickEvent={viewTaskDetail}
                validRange={{
                  start: currentDate.clone().add(1, 'month').startOf('month').format(dateFormat),
                  end: currentDate.clone().add(1, 'month').endOf('month').add(1, 'day').format(dateFormat),
                }}
                events={secondCalendarData}
              />
            </div>
            <div className="mb-5">
              <Typography.Title level={4} className={classNames(styles['calendar-title'])}>
                {convertToDateJP(currentDate.clone().add(2, 'month').startOf('month').format(dateFormat), 'yearMonth')}
              </Typography.Title>
              <TaskCalendar
                onClickEvent={viewTaskDetail}
                validRange={{
                  start: currentDate.clone().add(2, 'month').startOf('month').format(dateFormat),
                  end: currentDate.clone().add(2, 'month').endOf('month').add(1, 'day').format(dateFormat),
                }}
                events={thirdCalendarData}
              />
            </div>
          </Card>
        </div>
      )}
      <TransactionDetailModal
        calendarInfor={taskDetail}
        isVisible={isOpenTransactionInfor}
        onCancel={() => setOpenTransactionInfor(false)}
        currentUser={user}
        onOk={() => {
          setOpenTransactionInfor(false);
          setOpenCompleteTransactionModal(true);
        }}
      />
      <TaskDetailModal
        calendarInfor={taskDetail}
        isVisible={isTaskTodoDetailsPopupShow}
        onCancel={() => setIsTaskTodoDetailsPopupShow(false)}
      />
      {isOpenCompleteTransactionModal && (
        <CompleteTransactionModal
          visible={isOpenCompleteTransactionModal}
          transaction={(taskDetail as any)?.transaction}
          onCancel={() => {
            setOpenCompleteTransactionModal(false);
            getAllTaskCalendar();
            dispatchGetTodoTasks();
          }}
        />
      )}
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const { todoTasks, isTodoTasksLoading, isSubmitting: completeTaskSubmitting, isLoading: taskLoading, calendars } = state.taskReducer;
  const { user } = state.authReducer;

  return { todoTasks, user, isTodoTasksLoading, taskLoading, completeTaskSubmitting, calendars };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetTodoTasks: () => dispatch(getTodoTasks()),
  dispatchGetTaskCalendar: (payload: Payload) => dispatch(getTaskCalendar(payload)),
  dispatchUpdateFavoriteTodoState: (payload: Payload) => dispatch(updateFavoriteTodoState(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
