import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Checkbox, Col, Row, Typography } from 'antd';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { Dispatch } from 'redux';
import { useRouter } from 'next/router';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { SectionTitle } from '@/components/Typography';
import { FileIcon } from '@/assets/images';
import { getTasksByBusiness, updateFavoriteState } from '@/redux/actions';
import { Action, Payload } from '@/types';
import { RootState } from '@/redux/rootReducer';
import LoadingScreen from '@/components/LoadingScreen';
import TransactionTaskTable from '@/components/TransactionTaskTable';
import { Spacer } from '@/components/Spacer';
import { parseBoolean } from '@/utils/convertUtils';
import { getTaskByBusinessUnitFilterState, setTaskByBusinessUnitFilterState } from '@/utils/storage';

import styles from './styles.module.scss';
import SelectBusiness from './SelectBusiness';
import { mappingBusinessTasks } from './transformValue';

enum FilterMode {
  ThisMonth = 'ThisMonth',
  All = 'All',
}

type FilterModeType = keyof typeof FilterMode;

const Layout = ({
  businessTasks,
  businessUnitsRelative,
  isLoading,
  dispatchGetTasksByBusiness,
  dispatchUpdateFavoriteState,
}: PropsFromRedux) => {
  const [t] = useTranslation(['task', 'common']);
  const router = useRouter();

  const taskByBusinessUnitFilterState = useMemo(() => getTaskByBusinessUnitFilterState(), []);

  const [isShowFavorite, setShowFavorite] = useState(taskByBusinessUnitFilterState.isShowFavorite ?? false);
  const [filterMode, setFilterMode] = useState<FilterModeType>(taskByBusinessUnitFilterState.filterMode ?? FilterMode.ThisMonth);
  const { departmentId, majorCategoryId, middleCategoryId, onlyBelongToDepartment, onlyBelongToMajor } = router.query || {};

  const [selectedBusinessOption, setBusinessOption] = useState(
    JSON.stringify({
      departmentId: +departmentId,
      ...(majorCategoryId && { majorCategoryId: +majorCategoryId }),
      ...(middleCategoryId && { middleCategoryId: +middleCategoryId }),
      ...(onlyBelongToDepartment && { onlyBelongToDepartment: parseBoolean(onlyBelongToDepartment) }),
      ...(onlyBelongToMajor && { onlyBelongToMajor: parseBoolean(onlyBelongToMajor) }),
    })
  );

  const selectedDepartment = useMemo(
    () => businessUnitsRelative?.find(department => department.id === +departmentId),
    [businessUnitsRelative, departmentId]
  );

  const fetchBusinessTasks = useCallback(() => {
    dispatchGetTasksByBusiness({
      params: { ...JSON.parse(selectedBusinessOption), ...(filterMode === FilterMode.ThisMonth ? { month: new Date().getMonth() } : {}) },
    });
  }, [selectedBusinessOption, dispatchGetTasksByBusiness, filterMode]);

  const handleSelectBusiness = useCallback(
    (value: string) => {
      setBusinessOption(value);
      router.push({
        pathname: router.pathname,
        query: JSON.parse(value),
      });
    },
    [router]
  );

  const handleSwitchMode = useCallback(
    mode => {
      setFilterMode(mode);
      dispatchGetTasksByBusiness({
        params: { ...JSON.parse(selectedBusinessOption), ...(mode === FilterMode.ThisMonth ? { month: new Date().getMonth() } : {}) },
      });
    },
    [dispatchGetTasksByBusiness, selectedBusinessOption, setFilterMode]
  );

  const mappedBusinessTask = useMemo(() => {
    const selectedOption = JSON.parse(selectedBusinessOption) || {};
    return mappingBusinessTasks(selectedDepartment, businessTasks, selectedOption);
  }, [selectedDepartment, businessTasks, selectedBusinessOption]);

  const filterFavoriteRecord = useCallback(
    records => (isShowFavorite ? records?.filter(record => record.favoriteTransactions?.length || record.favoriteTasks?.length) : records),
    [isShowFavorite]
  );

  useEffect(() => {
    dispatchGetTasksByBusiness({
      params: {
        departmentId,
        majorCategoryId,
        middleCategoryId,
        onlyBelongToDepartment,
        onlyBelongToMajor,
        ...(filterMode === FilterMode.ThisMonth ? { month: new Date().getMonth() } : {}),
      },
    });
  }, []);

  useEffect(() => {
    setTaskByBusinessUnitFilterState({ isShowFavorite, filterMode });
  }, [isShowFavorite, filterMode]);

  return (
    <WithAuth title={t('task_by_business_page_title')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <div>
        <Row className={styles['mobile-padding']} align="bottom" gutter={0}>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
            <SectionTitle level={3} icon={<FileIcon />}>
              {t('task_of_department', { departmentName: selectedDepartment?.name })}
            </SectionTitle>
          </Col>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
            <div className="d-flex flex-column align-items-end">
              <Checkbox
                checked={isShowFavorite}
                onChange={event => setShowFavorite(event?.target?.checked)}
                className={classNames(styles['favorite-checkbox'], 'text-nowrap')}
              >
                {t('filter_favorite_tasks')}
              </Checkbox>
            </div>
            <Spacer height="17px" />
            <SelectBusiness selectedValue={selectedBusinessOption} onSelect={handleSelectBusiness} t={t} department={selectedDepartment} />
          </Col>
        </Row>
        <Card bordered={false}>
          <p className={styles['switch-container']}>
            <span
              onClick={() => handleSwitchMode(FilterMode.ThisMonth)}
              className={classNames(styles['switch-button'], filterMode === FilterMode.ThisMonth ? styles.active : '')}
            >
              {t('filter_in_month')}
            </span>
            <span
              onClick={() => handleSwitchMode(FilterMode.All)}
              className={classNames(styles['switch-button'], filterMode === FilterMode.All ? styles.active : '')}
            >
              {t('filter_all')}
            </span>
          </p>
          {mappedBusinessTask.isShowBusinessTasks && !!mappedBusinessTask?.businessTasks?.length && (
            <div className={styles['business-task-major']}>
              <Typography.Paragraph className={styles['business-title']}>{t('no_business_unit')}</Typography.Paragraph>
              <div className={styles['business-task-middle']}>
                <TransactionTaskTable
                  onStarCallback={dispatchUpdateFavoriteState}
                  transactions={filterFavoriteRecord(mappedBusinessTask?.businessTasks as any)}
                  updateTransactionCallback={fetchBusinessTasks}
                  isFavorite={isShowFavorite}
                  backUrl={router.asPath}
                />
              </div>
            </div>
          )}
          {mappedBusinessTask.majorCategories?.map(majorCategory => (
            <div key={`major-${majorCategory.id}`} className={styles['business-task-major']}>
              <Typography.Paragraph className={styles['business-title']}>{majorCategory?.name}</Typography.Paragraph>
              {majorCategory.isShowBusinessTasks && !!majorCategory.businessTasks.length && (
                <div className={styles['business-task-middle']}>
                  <TransactionTaskTable
                    onStarCallback={dispatchUpdateFavoriteState}
                    transactions={filterFavoriteRecord(majorCategory?.businessTasks as any)}
                    updateTransactionCallback={fetchBusinessTasks}
                    isFavorite={isShowFavorite}
                    backUrl={router.asPath}
                  />
                </div>
              )}
              {majorCategory?.middleCategories?.map(middleCategory => (
                <div key={`middle-${middleCategory.id}`} className={styles['business-task-middle']}>
                  <Typography.Paragraph className={styles['tasks-title']}>{middleCategory?.name}</Typography.Paragraph>
                  <TransactionTaskTable
                    onStarCallback={dispatchUpdateFavoriteState}
                    transactions={filterFavoriteRecord(middleCategory?.businessTasks as any)}
                    updateTransactionCallback={fetchBusinessTasks}
                    isFavorite={isShowFavorite}
                    backUrl={router.asPath}
                  />
                </div>
              ))}
            </div>
          ))}
        </Card>
        <Row className={classNames(styles['mobile-padding'], 'mt-3')}>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 12, offset: 12 }} lg={{ span: 8, offset: 16 }}>
            <SelectBusiness selectedValue={selectedBusinessOption} onSelect={handleSelectBusiness} t={t} department={selectedDepartment} />
          </Col>
        </Row>
      </div>
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const { businessTasks, isLoading } = state.taskReducer;
  const { businessUnitsRelative } = state.businessUnitReducer;

  return { businessTasks, isLoading, businessUnitsRelative };
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetTasksByBusiness: (payload: Payload) => dispatch(getTasksByBusiness(payload)),
  dispatchUpdateFavoriteState: (payload: Payload) => dispatch(updateFavoriteState(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
