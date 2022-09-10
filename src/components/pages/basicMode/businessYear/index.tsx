import React, { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Checkbox, Col, Row, Typography } from 'antd';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { range, groupBy, isEmpty } from 'lodash';
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
import { getBusinessUnitYearFilterState, setBusinessUnitYearFilterState } from '@/utils/storage';

import { taskBasisTypes } from '../../tasks/constants';
import BusinessTaskTable from '../businessTaskTable';

import styles from './styles.module.scss';

const Layout = ({ isLoading, user, dispatchGetBusinessTaskInYear, businessTasks }: PropsFromRedux) => {
  const [t] = useTranslation(['task', 'common']);

  const businessUnitYearFilterState = useMemo(() => getBusinessUnitYearFilterState(), []);

  const [isShowFavoriteTask, setShowFavoriteTask] = useState<boolean>(businessUnitYearFilterState.isShowFavoriteTask ?? false);
  const [sectionId, setSectionId] = useState<string>('');
  const router = useRouter();

  const groupedTask = useMemo(() => {
    const tasksByMonth = Array.from(Array(12), () => []);
    const actualTasks = [];
    const groupedMonthyTasks = Array.from(Array(12), () => ({} as { [key: string]: any }));
    businessTasks?.forEach((task: Task) => {
      if (task.taskAnnuallyPeriods?.length) {
        const { specifiedMonth } = task.taskAnnuallyPeriods?.[0] || {};
        if (specifiedMonth) {
          tasksByMonth[specifiedMonth - 1].push(task);
        }
      }

      if (task.basisType === taskBasisTypes.actual) {
        actualTasks.push(task);
      }
    });

    tasksByMonth.forEach((tasks, month) => {
      groupedMonthyTasks[month] = groupBy(tasks, task => getShortTaskPeriod(task, t, (month + 1).toString()));
      delete groupedMonthyTasks[month].empty;
    });

    return {
      monthyTasks: groupedMonthyTasks,
      actualTasks,
    };
  }, [businessTasks, t]);

  const filterFavoriteTasks = useCallback(
    records => (isShowFavoriteTask ? records?.filter(record => record.favoriteTasks?.length) : records),
    [isShowFavoriteTask]
  );

  const backUrl = useMemo(() => {
    if (!sectionId) {
      return paths.tasks.businessInYear;
    }

    return `${paths.tasks.businessInYear}?section=${sectionId}`;
  }, [sectionId]);

  const getBusinessTasks = useCallback(() => {
    dispatchGetBusinessTaskInYear({ params: { year: new Date().getFullYear() } });
  }, [dispatchGetBusinessTaskInYear]);

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
    setBusinessUnitYearFilterState({ isShowFavoriteTask });
  }, [isShowFavoriteTask]);

  return (
    <WithAuth title={t('common:page_task_by_deadline')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <div>
        <Row className={styles['mobile-padding']} align="middle" gutter={0}>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
            <SectionTitle level={3} icon={<FileIcon />}>
              {t('business_task_one_year', { departmentName: user?.department?.name })}
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
            {range(12).map(month => (
              <span key={month} onClick={() => handleOnClick(`month-${month + 1}`)} className={styles['goto-button']}>
                {t('common:month_no', { month: month + 1 })}
                <DoubleArrowDownIcon />
              </span>
            ))}
            <span onClick={() => handleOnClick('actualTask')} className={styles['goto-button']}>
              {t('as_needed')}
              <DoubleArrowDownIcon />
            </span>
          </div>
          {groupedTask.monthyTasks?.map((groupedTaskInMonth, month) => (
            <div key={month} id={`month-${month + 1}`} className={styles['monthly-task']}>
              <Typography.Paragraph className={styles['month-title']}>{t('common:month_no', { month: month + 1 })}</Typography.Paragraph>
              {isEmpty(groupedTaskInMonth) ? (
                <div className={classNames(styles['nodata-indication'], 'mb-px-30')}>{t('common:nodata')}</div>
              ) : (
                <>
                  {getSortedGroup(t, (month + 1).toString()).sortedMonth.map(label =>
                    groupedTaskInMonth[label] ? (
                      <div key={label} className={styles['daily-task']}>
                        <Typography.Paragraph className={styles['daily-title']}>{label}</Typography.Paragraph>
                        <BusinessTaskTable
                          isFavorite={isShowFavoriteTask}
                          tasks={filterFavoriteTasks(groupedTaskInMonth[label])}
                          backUrl={backUrl}
                        />
                      </div>
                    ) : null
                  )}
                </>
              )}
            </div>
          ))}
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
  dispatchGetBusinessTaskInYear: (payload: Payload) => dispatch(getDeadlineTasks(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
