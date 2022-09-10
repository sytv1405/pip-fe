import { Card, Radio, Select, Typography } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

import { DownIcon, DueDateIcon, OccurTimeIcon } from '@/assets/images';
import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { searchDepartments } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import { Action, Payload } from '@/types';
import { mapOptions } from '@/utils/selects';
import { LEVEL_BUSINESS_UNIT } from '@/shared/constants';
import LoadingScreen from '@/components/LoadingScreen';

import TableTransaction from './TableTransaction';
import styles from './styles.module.scss';

const TransactionBatchRegistration = (props: PropsFromRedux) => {
  const { dispatchSearchDepartments, departments, departmentsLoading, currentUser } = props || {};
  const [t] = useTranslation(['transaction_batch_registration']);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(currentUser?.departmentId);
  const [levelBusiness, setLevelBusiness] = useState(LEVEL_BUSINESS_UNIT.all);

  const handleChangeLevelBusiness = useCallback(
    e => {
      if (e.target.value !== levelBusiness) setLevelBusiness(e.target.value);
    },
    [levelBusiness]
  );

  const handleChangeDepartment = useCallback(
    departmentId => {
      if (departmentId !== selectedDepartmentId) setSelectedDepartmentId(departmentId);
    },
    [selectedDepartmentId]
  );

  const departmentsOptions = useMemo(() => mapOptions(departments, { labelKey: 'name', valueKey: 'id' }), [departments]);

  const levelBusinessUnitJP = useMemo(() => {
    switch (levelBusiness) {
      case LEVEL_BUSINESS_UNIT.all:
        return t('message_set_person_in_charge_for_all_task');
      case LEVEL_BUSINESS_UNIT.large:
        return t('message_set_person_in_charge', { level: t('common:large') });
      case LEVEL_BUSINESS_UNIT.medium:
        return t('message_set_person_in_charge', { level: t('common:medium') });
      default:
        return t('message_set_person_in_charge', { level: t('common:small') });
    }
  }, [levelBusiness, t]);

  useEffect(() => {
    dispatchSearchDepartments({ params: {} });
  }, [dispatchSearchDepartments]);

  return (
    <WithAuth title={t('title')} isContentFullWidth>
      {departmentsLoading && <LoadingScreen />}
      <Card className={styles['card-component']} bordered={false}>
        <div className={styles['header-container']}>
          <div className="d-flex mb-3">
            <Typography.Title className="mr-4" level={5}>
              {t('select_target_department')}
            </Typography.Title>
            <Select
              className={styles['custom-select']}
              dropdownClassName={styles['select-department']}
              value={selectedDepartmentId}
              onChange={id => handleChangeDepartment(id)}
              options={departmentsOptions}
              suffixIcon={<DownIcon />}
            />
          </div>
          <div className="d-flex">
            <Typography.Title className="mr-4" level={5}>
              {t('level_business_unit')}
            </Typography.Title>
            <Radio.Group
              onChange={handleChangeLevelBusiness}
              value={selectedDepartmentId ? levelBusiness : ''}
              disabled={!selectedDepartmentId}
              className="radio-color-green"
            >
              <Radio value={LEVEL_BUSINESS_UNIT.all}> {t('common:all')}</Radio>
              <Radio value={LEVEL_BUSINESS_UNIT.large}> {t('common:large')}</Radio>
              <Radio value={LEVEL_BUSINESS_UNIT.medium}> {t('common:medium')}</Radio>
              <Radio value={LEVEL_BUSINESS_UNIT.small}> {t('common:small')}</Radio>
            </Radio.Group>
          </div>
        </div>

        <Typography.Paragraph className="mt-2">{levelBusinessUnitJP}</Typography.Paragraph>

        <div className="d-flex align-items-center">
          <Typography.Title className={classNames(styles['person-in-charge'], 'mr-4 mb-0')} level={4}>
            {t('assign_person_in_charge')}
          </Typography.Title>
          <div className="d-flex align-items-center mr-3">
            <DueDateIcon />
            <span className={styles['three-dots']}>...</span>
            <Typography.Paragraph className="mb-0">{t('task_due_date')}</Typography.Paragraph>
          </div>
          <div className="d-flex align-items-center">
            <OccurTimeIcon />
            <span className={styles['three-dots']}>...</span>
            <Typography.Paragraph className="mb-0">{t('task_occur_time')}</Typography.Paragraph>
          </div>
        </div>
        <div className={styles['body-container']}>
          {levelBusiness && <TableTransaction deparmentId={selectedDepartmentId} levelBusinessId={levelBusiness} />}
        </div>
      </Card>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchSearchDepartments: (payload: Payload) => dispatch(searchDepartments(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { departments, isLoading: departmentsLoading } = state.departmentReducer;
  const { user: currentUser } = state.authReducer;
  return { departments, departmentsLoading, currentUser };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(TransactionBatchRegistration);
