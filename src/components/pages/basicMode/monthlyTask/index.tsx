import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Checkbox, Col, Row, Select, Typography } from 'antd';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { range, groupBy, isEmpty } from 'lodash';
import moment from 'moment';
import { Dispatch } from 'redux';
import { useRouter } from 'next/router';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { SectionTitle } from '@/components/Typography';
import { DownIcon, FileIcon } from '@/assets/images';
import { RootState } from '@/redux/rootReducer';
import LoadingScreen from '@/components/LoadingScreen';
import TransactionTaskTable from '@/components/TransactionTaskTable';
import { Spacer } from '@/components/Spacer';
import { Label } from '@/components/form';
import { monthYearFormat, shortDayMonthJPFormat } from '@/shared/constants';
import { convertToDateJP, getShortTaskPeriod, getSortedGroup } from '@/shared/calendar';
import { Action, Payload } from '@/types';
import { getDeadlineTasks, updateFavoriteState } from '@/redux/actions';
import { MONTH_YEAR_REGEX } from '@/shared/regex';
import { paths } from '@/shared/paths';
import { formatDateTime } from '@/utils/dateTimeUtils';
import { getMonthlyTaskFilterState, setMonthlyTaskFilterState } from '@/utils/storage';

import styles from './styles.module.scss';

const Layout = ({ isLoading, dispatchGetDeadlineTasks, businessTasks, dispatchUpdateFavoriteState }: PropsFromRedux) => {
  const [t] = useTranslation(['task', 'common']);
  const router = useRouter();

  const monthlyTaskFilterState = useMemo(() => getMonthlyTaskFilterState(), []);

  const [selectedMonth, setSelectedMonth] = useState<string>(monthlyTaskFilterState.selectedMonth ?? '');
  const [isShowFavoriteTask, setShowFavoriteTask] = useState<boolean>(monthlyTaskFilterState.isShowFavoriteTask ?? false);

  const monthlyOptions = useMemo(() => {
    const { date } = router.query;
    const { groups: { year, month } = {} } = MONTH_YEAR_REGEX.exec(date as string) || ({} as { groups: { month: string; year: string } });
    const queryDate = moment()
      .year(+year)
      .month(+month - 1);
    const diffMonth = queryDate.diff(moment(), 'month');
    let additionYear;
    if (diffMonth > 11) {
      additionYear = 1;
    } else {
      additionYear = diffMonth < 0 ? -1 : 0;
    }

    return range(12).map(num => {
      const displayMonth = moment().add(additionYear, 'year').add(num, 'months');
      return {
        value: displayMonth.format(monthYearFormat),
        label: convertToDateJP(displayMonth, 'yearMonth'),
      };
    });
  }, [router.query]);

  const selectedLabel = useMemo(
    () => monthlyOptions?.find(option => option.value === selectedMonth)?.label,
    [monthlyOptions, selectedMonth]
  );

  const groupedTasks = useMemo(() => {
    const { groups: { month } = {} } = MONTH_YEAR_REGEX.exec(selectedMonth) || ({} as { groups: { month: string; year: string } });
    const grouped = groupBy(businessTasks, taskOrTransaction => {
      if (taskOrTransaction.task) {
        return formatDateTime(taskOrTransaction.completionDate, shortDayMonthJPFormat);
      }
      return getShortTaskPeriod(taskOrTransaction, t, (+month).toString());
    });

    delete grouped.empty;
    return grouped;
  }, [businessTasks, selectedMonth, t]);

  const filterFavoriteTasks = useCallback(
    records =>
      isShowFavoriteTask ? records?.filter(record => record.favoriteTasks?.length || record.favoriteTransactions?.length) : records,
    [isShowFavoriteTask]
  );

  const handleSelectMonth = useCallback(
    monthTarget => {
      router.push({ pathname: paths.tasks.monthly, query: { date: monthTarget } });
    },
    [router]
  );

  const getMonthlyTasks = useCallback(() => {
    const { date } = router.query;
    if (!MONTH_YEAR_REGEX.test(date as string)) {
      router.push(paths.home);
    }

    const { groups: { month, year } = {} } = MONTH_YEAR_REGEX.exec(date as string) || ({} as { groups: { month: string; year: string } });
    setSelectedMonth(date as string);
    dispatchGetDeadlineTasks({ params: { month, year } });
  }, [router, dispatchGetDeadlineTasks]);

  const sortedLabel = useMemo(() => {
    const { groups: { month } = {} } = MONTH_YEAR_REGEX.exec(selectedMonth) || ({} as { groups: { month: string; year: string } });
    return getSortedGroup(t, (+month).toString());
  }, [selectedMonth, t]);

  useEffect(() => {
    getMonthlyTasks();
  }, [getMonthlyTasks]);

  useEffect(() => {
    setMonthlyTaskFilterState({ selectedMonth, isShowFavoriteTask });
  }, [selectedMonth, isShowFavoriteTask]);

  return (
    <WithAuth title={t('common:page_task_by_deadline')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <div>
        <Row className={styles['mobile-padding']} align="bottom" gutter={0}>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
            <SectionTitle level={3} icon={<FileIcon />}>
              {t('common:page_monthly_task')}
            </SectionTitle>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
            <div className="d-flex flex-column align-items-end">
              <Checkbox
                checked={isShowFavoriteTask}
                onChange={event => setShowFavoriteTask(event?.target?.checked)}
                className={classNames(styles['favorite-checkbox'], 'text-nowrap')}
              >
                {t('filter_favorite_tasks')}
              </Checkbox>
            </div>
            <Spacer height="17px" />
            <div className={classNames(styles['month-select-section'])}>
              <Label className="mb-0 mr-px-10 text-nowrap font-size-14">{t('select_month')}</Label>
              <Select
                onChange={handleSelectMonth}
                value={selectedMonth}
                className={styles['month-select']}
                size="large"
                options={monthlyOptions}
                suffixIcon={<DownIcon />}
              />
            </div>
          </Col>
        </Row>
        <Card bordered={false}>
          <div className={styles['monthly-task']}>
            <Typography.Paragraph className={styles['month-title']}>{selectedLabel}</Typography.Paragraph>
            {isEmpty(groupedTasks) ? (
              <div className={styles['nodata-indication']}>{t('common:nodata')}</div>
            ) : (
              <>
                {sortedLabel.sortedAll?.map(label =>
                  groupedTasks[label] ? (
                    <div className={styles['daily-task']} key={label}>
                      <Typography.Paragraph className={styles['daily-title']}>{label}</Typography.Paragraph>
                      <TransactionTaskTable
                        transactions={filterFavoriteTasks(groupedTasks[label])}
                        onStarCallback={dispatchUpdateFavoriteState}
                        updateTransactionCallback={getMonthlyTasks}
                        backUrl={router.asPath}
                        isFavorite={isShowFavoriteTask}
                      />
                    </div>
                  ) : null
                )}
              </>
            )}
          </div>
        </Card>
        <Row className={classNames(styles['mobile-padding'], 'mt-3')}>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12, offset: 12 }} lg={{ span: 8, offset: 16 }}>
            <div className={classNames(styles['month-select-section'])}>
              <Label className="mb-0 mr-px-10 text-nowrap font-size-14">{t('select_month')}</Label>
              <Select
                onChange={handleSelectMonth}
                value={selectedMonth}
                className={styles['month-select']}
                size="large"
                options={monthlyOptions}
                suffixIcon={<DownIcon />}
              />
            </div>
          </Col>
        </Row>
      </div>
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const { isLoading, businessTasks } = state.taskReducer;

  return { isLoading, businessTasks };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetDeadlineTasks: (payload: Payload) => dispatch(getDeadlineTasks(payload)),
  dispatchUpdateFavoriteState: (payload: Payload) => dispatch(updateFavoriteState(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
