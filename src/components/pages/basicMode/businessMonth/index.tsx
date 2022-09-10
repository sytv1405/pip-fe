import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Checkbox, Col, Row, Typography } from 'antd';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { groupBy, isEmpty } from 'lodash';
import { Dispatch } from 'redux';
import { useRouter } from 'next/router';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { SectionTitle } from '@/components/Typography';
import { DoubleArrowDownIcon, FileIcon } from '@/assets/images';
import { RootState } from '@/redux/rootReducer';
import LoadingScreen from '@/components/LoadingScreen';
import { Action, Payload, Task } from '@/types';
import { getDeadlineTasks } from '@/redux/actions';
import { getShortTaskPeriod, getSortedGroup } from '@/shared/calendar';
import { paths } from '@/shared/paths';
import { getBusinessUnitMonthFilterState, setBusinessUnitMonthFilterState } from '@/utils/storage';

import { taskBasisTypes } from '../../tasks/constants';
import BusinessTaskTable from '../businessTaskTable';

import styles from './styles.module.scss';

const Layout = ({ isLoading, user, dispatchGetBusinessTaskInMonth, businessTasks }: PropsFromRedux) => {
  const [t] = useTranslation(['task', 'common']);

  const businessUnitMonthFilterState = useMemo(() => getBusinessUnitMonthFilterState(), []);

  const [isShowFavoriteTask, setShowFavoriteTask] = useState<boolean>(businessUnitMonthFilterState.isShowFavoriteTask ?? false);
  const [sectionId, setSectionId] = useState<string>('');
  const router = useRouter();

  const groupedTask = useMemo(() => {
    const monthlyTasks = [];
    const weeklyTasks = [];
    const actualTasks = [];
    businessTasks?.forEach((task: Task) => {
      if (task.taskMonthlyPeriods?.length) {
        monthlyTasks.push(task);
      }
      if (task.taskWeeklyPeriods?.length) {
        weeklyTasks.push(task);
      }
      if (task.basisType === taskBasisTypes.actual) {
        actualTasks.push(task);
      }
    });

    const groupedMonthly = groupBy(monthlyTasks, task => getShortTaskPeriod(task, t));
    const groupedWeekly = groupBy(weeklyTasks, task => getShortTaskPeriod(task, t));

    delete groupedMonthly.empty;
    delete groupedWeekly.empty;

    return {
      monthlyTasks: groupedMonthly,
      weeklyTasks: groupedWeekly,
      actualTasks,
    };
  }, [businessTasks, t]);

  const filterFavoriteTasks = useCallback(
    records => (isShowFavoriteTask ? records?.filter(record => record.favoriteTasks?.length) : records),
    [isShowFavoriteTask]
  );

  const sortedLabel = useMemo(() => getSortedGroup(t), [t]);

  const backUrl = useMemo(() => {
    if (!sectionId) {
      return paths.tasks.businessInMonth;
    }

    return `${paths.tasks.businessInMonth}?section=${sectionId}`;
  }, [sectionId]);

  const getBusinessTasks = useCallback(() => {
    dispatchGetBusinessTaskInMonth({ params: { month: new Date().getMonth() } });
  }, [dispatchGetBusinessTaskInMonth]);

  const handleOnClick = useCallback(
    (id: string) => {
      const element = document.getElementById(id);

      setSectionId(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    },
    [setSectionId]
  );

  useEffect(() => {
    getBusinessTasks();

    const { section } = router.query || {};
    const element = document.getElementById(section as string);
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  useEffect(() => {
    setBusinessUnitMonthFilterState({ isShowFavoriteTask });
  }, [isShowFavoriteTask]);

  return (
    <WithAuth title={t('common:page_task_by_deadline')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <div>
        <Row className={styles['mobile-padding']} align="middle" gutter={0}>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
            <SectionTitle level={3} icon={<FileIcon />}>
              {t('business_task_one_month', { departmentName: user?.department?.name })}
            </SectionTitle>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
            <div className="d-flex justify-content-end align-items-center">
              <Checkbox
                checked={isShowFavoriteTask}
                onChange={event => setShowFavoriteTask(event?.target?.checked)}
                className={classNames(styles['favorite-checkbox'], 'text-nowrap')}
              >
                {t('filter_favorite_tasks')}
              </Checkbox>
            </div>
          </Col>
        </Row>
        <Card bordered={false}>
          <div className={styles['goto-container']}>
            <span onClick={() => handleOnClick('monthyTask')} className={styles['goto-button']}>
              {t('monthly')}
              <DoubleArrowDownIcon />
            </span>
            <span onClick={() => handleOnClick('weeklyTask')} className={styles['goto-button']}>
              {t('weekly')}
              <DoubleArrowDownIcon />
            </span>
            <span onClick={() => handleOnClick('actualTask')} className={styles['goto-button']}>
              {t('as_needed')}
              <DoubleArrowDownIcon />
            </span>
          </div>
          <div id="monthyTask" className={styles['monthly-task']}>
            <Typography.Paragraph className={styles['month-title']}>{t('monthly')}</Typography.Paragraph>
            {isEmpty(groupedTask.monthlyTasks) ? (
              <div className={classNames(styles['nodata-indication'], 'mb-px-30')}>{t('common:nodata')}</div>
            ) : (
              <>
                {sortedLabel.sortedMonth.map(label =>
                  groupedTask.monthlyTasks[label] ? (
                    <div className={styles['daily-task']} key={label}>
                      <Typography.Paragraph className={styles['daily-title']}>{label}</Typography.Paragraph>
                      <BusinessTaskTable
                        isFavorite={isShowFavoriteTask}
                        tasks={filterFavoriteTasks(groupedTask.monthlyTasks[label])}
                        backUrl={backUrl}
                      />
                    </div>
                  ) : null
                )}
              </>
            )}
          </div>
          <div id="weeklyTask" className={styles['monthly-task']}>
            <Typography.Paragraph className={styles['month-title']}>{t('weekly')}</Typography.Paragraph>
            {isEmpty(groupedTask.weeklyTasks) ? (
              <div className={classNames(styles['nodata-indication'], 'mb-px-30')}>{t('common:nodata')}</div>
            ) : (
              <>
                {sortedLabel.sortedWeek.map(label =>
                  groupedTask.weeklyTasks[label] ? (
                    <div className={styles['daily-task']} key={label}>
                      <Typography.Paragraph className={styles['daily-title']}>{label}</Typography.Paragraph>
                      <BusinessTaskTable
                        isFavorite={isShowFavoriteTask}
                        tasks={filterFavoriteTasks(groupedTask.weeklyTasks[label])}
                        backUrl={backUrl}
                      />
                    </div>
                  ) : null
                )}
              </>
            )}
          </div>
          <div id="actualTask" className={styles['monthly-task']}>
            <Typography.Paragraph className={styles['month-title']}>{t('as_needed')}</Typography.Paragraph>
            <div className={styles['daily-task']}>
              <BusinessTaskTable isFavorite={isShowFavoriteTask} tasks={filterFavoriteTasks(groupedTask.actualTasks)} backUrl={backUrl} />
            </div>
          </div>
        </Card>
      </div>
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const { user } = state.authReducer;
  const { isLoading, businessTasks } = state.taskReducer;
  return { isLoading, businessTasks, user };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetBusinessTaskInMonth: (payload: Payload) => dispatch(getDeadlineTasks(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
