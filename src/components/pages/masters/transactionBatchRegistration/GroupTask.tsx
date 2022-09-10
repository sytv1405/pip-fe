import { Button, Modal, Select, Table, Typography } from 'antd';
import classNames from 'classnames';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { DownIcon, DueDateIcon, OccurTimeIcon } from '@/assets/images';
import { RootState } from '@/redux/rootReducer';
import { createBulkTransaction, getNotifications, getTaskForBulkTransaction, getUsers } from '@/redux/actions';
import { Link, useTranslation } from 'i18next-config';
import { convertToDateJP } from '@/utils/dateJp';
import { getCategorySeparatorOfTable } from '@/shared/table';
import { Action, Payload, Task } from '@/types';
import { mapOptions } from '@/utils/selects';
import { LEVEL_BUSINESS_UNIT, PAGINATE_NOTIFICATIONS } from '@/shared/constants';
import { paths } from '@/shared/paths';

import { taskBasisTypes } from '../../tasks/constants';

import styles from './styles.module.scss';

interface TransactionItemProps extends PropsFromRedux {
  tasksByCategory: Task[];
  levelBusinessId?: string;
  deparmentId?: number;
}

const GroupTask = (props: TransactionItemProps) => {
  const {
    levelBusinessId,
    deparmentId,
    users,
    userDetail,
    tasks,
    taskLoading,
    tasksByCategory,
    dispatchGetUsers,
    dispatchCreateTaskBulkTransaction,
    dispatchGetTaskForBulkTransaction,
    dispatchGetNotifications,
    status,
  } = props || {};
  const [t] = useTranslation(['transaction_batch_registration']);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [practitioner, setPractitioner] = useState();
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [isShowModalSuccessTransaction, setShowModalSuccessTransaction] = useState(false);

  const transactionColumns = useMemo(
    () => [
      {
        title: <span className={styles['title-column']}>{t('task_name')}</span>,
        dataIndex: 'title',
        className: 'font-weight-bold',
        render: (text: string, record) => (
          <div className={classNames(styles['column-task'], 'd-flex align-items-center justify-content-between')}>
            <div className={styles['column-task__infor']}>
              <div className="d-flex align-items-center">
                {record?.basisType === taskBasisTypes.deadline && <DueDateIcon />}
                {record?.basisType === taskBasisTypes.actual && <OccurTimeIcon />}
                <Link href={{ pathname: paths.tasks.show, query: { taskCode: record?.taskCode } }} passHref>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classNames(
                      styles['task-name'],
                      { [styles['task-name__no_basisType']]: !record?.basisType },
                      'text-underline text-secondary font-weight-normal ml-2'
                    )}
                  >
                    {text}
                  </a>
                </Link>
              </div>
              {levelBusinessId === LEVEL_BUSINESS_UNIT.all && (
                <Typography.Paragraph className="mb-0 font-weight-normal">
                  <span className="font-weight-medium">{record?.majorCategory?.name}</span>
                  {record?.middleCategory?.name && (
                    <>
                      {getCategorySeparatorOfTable()}
                      {record?.middleCategory?.name}
                    </>
                  )}
                  {record?.minorCategory?.name && (
                    <>
                      {getCategorySeparatorOfTable()}
                      {record?.minorCategory?.name}
                    </>
                  )}
                </Typography.Paragraph>
              )}
            </div>
            {record?.latestTransaction && (
              <div className={styles['column-task__datetime']}>
                {t('infor_task_user', {
                  datetime: convertToDateJP(record?.latestTransaction?.createdAt, 'dateTimeWithoutSpace'),
                  assignee: record?.latestTransaction?.assignee?.name,
                })}
              </div>
            )}
          </div>
        ),
      },
    ],
    [levelBusinessId, t]
  );

  const handleBulkTransaction = useCallback(() => {
    if (selectedTaskIds.length && practitioner) {
      const taskParams = tasks
        .filter(task => selectedTaskIds.includes(task.id))
        .map(taskSelected => ({
          id: taskSelected.id,
          title: taskSelected.title,
        }));
      dispatchCreateTaskBulkTransaction({
        params: { tasks: taskParams, practitioner },
        callback: () => {
          dispatchGetTaskForBulkTransaction({
            params: {
              businessUnitLevel: levelBusinessId || LEVEL_BUSINESS_UNIT.all,
              departmentId: deparmentId || null,
            },
          });
          dispatchGetNotifications({
            params: {
              offset: PAGINATE_NOTIFICATIONS.offset,
              limit: PAGINATE_NOTIFICATIONS.limit,
              page: PAGINATE_NOTIFICATIONS.page,
              isForceRefresh: true,
              status,
            },
          });
          setIsShowModalConfirm(false);
          setShowModalSuccessTransaction(true);
        },
      });
    }
  }, [
    selectedTaskIds,
    practitioner,
    tasks,
    dispatchCreateTaskBulkTransaction,
    dispatchGetTaskForBulkTransaction,
    levelBusinessId,
    deparmentId,
    dispatchGetNotifications,
    status,
  ]);

  const userAssignOptions = useMemo(() => mapOptions(users, { labelKey: 'name', valueKey: 'id' }), [users]);

  const personInChargeName = useMemo(() => (practitioner ? users.find(user => user.id === practitioner)?.name : {}), [practitioner, users]);

  useEffect(() => {
    if (deparmentId && levelBusinessId)
      dispatchGetTaskForBulkTransaction({
        params: {
          businessUnitLevel: levelBusinessId || '',
          departmentId: deparmentId || null,
        },
        callback: () => {
          setPractitioner(null);
          setSelectedTaskIds([]);
        },
      });
  }, [deparmentId, dispatchGetTaskForBulkTransaction, levelBusinessId]);

  useEffect(() => {
    if (userDetail?.organizationId) {
      dispatchGetUsers({ params: { organizationIds: [userDetail?.organizationId] } });
    }
  }, [dispatchGetUsers, userDetail?.organizationId]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="d-flex align-items-center">
          <span className="font-weight-medium mr-3">{t('assign_person')}</span>
          <Select
            className={(classNames(styles['custom-select']), 'mn-w170p')}
            showSearch
            dropdownClassName={styles['select-assignee']}
            filterOption={(inputValue, option) => option.props.label?.toString().toLowerCase().includes(inputValue.toLowerCase())}
            value={practitioner || undefined}
            onChange={idPerson => setPractitioner(idPerson)}
            options={userAssignOptions}
            suffixIcon={<DownIcon />}
            allowClear
          />
        </div>
        <Button
          onClick={() => setIsShowModalConfirm(true)}
          className={classNames(styles['btn-selected-task'], 'mn-w180p font-weight-bold')}
          disabled={!selectedTaskIds.length || !practitioner}
          type="primary"
        >
          {t('btn_start_selected_task')}
        </Button>
      </div>
      <Table
        className={classNames(styles['transaction-table'], 'mt-3')}
        pagination={false}
        loading={taskLoading}
        columns={transactionColumns}
        rowKey="id"
        dataSource={tasksByCategory}
        rowSelection={{
          type: 'checkbox',
          onChange: newselectedTaskIds => {
            setSelectedTaskIds(newselectedTaskIds as number[]);
          },
          selectedRowKeys: selectedTaskIds,
        }}
      />
      <div className="d-flex justify-content-end">
        <Button
          onClick={() => setIsShowModalConfirm(true)}
          className={classNames(styles['btn-selected-task'], 'd-flex justify-content-end mn-w180p font-weight-bold')}
          disabled={!selectedTaskIds.length || !practitioner}
          type="primary"
        >
          {t('btn_start_selected_task')}
        </Button>
      </div>

      <Modal
        className={classNames(styles['modal-confirm-transaction'], 'modal-confirm modal-footer-center')}
        onCancel={() => setIsShowModalConfirm(false)}
        centered
        visible={isShowModalConfirm}
        footer={[
          <Button
            size="large"
            key="cancel"
            shape="round"
            className="mn-w150p color-text font-weight-bold"
            onClick={() => setIsShowModalConfirm(false)}
          >
            {t('common:button_cancel')}
          </Button>,
          <Button
            size="large"
            key="submit"
            shape="round"
            className="mn-w150p font-weight-bold"
            type="primary"
            loading={taskLoading}
            onClick={handleBulkTransaction}
          >
            {t('button_assign')}
          </Button>,
        ]}
      >
        <Typography.Title level={4} className="title-section mb-2 color-text">
          {t('title_modal_transaction')}
        </Typography.Title>
        <Typography.Paragraph className="preview-content p-2 mt-2">
          <p className="desc mb-0">
            <span className={classNames(styles['content-modal'], 'preview-value text-pre-line font-weight-normal')}>
              {t('message_assgin_transaction_for_user', { count: selectedTaskIds.length, name: personInChargeName })}
            </span>
          </p>
        </Typography.Paragraph>
      </Modal>

      <Modal
        className={classNames(styles['modal-confirm-transaction'], 'modal-confirm modal-footer-center')}
        onCancel={() => {
          setShowModalSuccessTransaction(false);
          setPractitioner(null);
          setSelectedTaskIds([]);
        }}
        centered
        visible={isShowModalSuccessTransaction}
        footer={[
          <Button
            size="large"
            key="submit"
            shape="round"
            type="primary"
            className={classNames(styles['btn-confirm-done-transaction'], 'mn-w150p font-weight-bold')}
            onClick={() => {
              setShowModalSuccessTransaction(false);
              setPractitioner(null);
              setSelectedTaskIds([]);
            }}
          >
            {t('common:button_close')}
          </Button>,
        ]}
      >
        <p className={classNames(styles['content-modal'], 'text-center mb-0 text-pre-line font-weight-normal')}>
          {t('message_confirm_assgin_transaction_success', { count: selectedTaskIds.length, name: personInChargeName })}
        </p>
      </Modal>
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetTaskForBulkTransaction: (payload: Payload) => dispatch(getTaskForBulkTransaction(payload)),
  dispatchGetUsers: (payload: Payload) => dispatch(getUsers(payload)),
  dispatchCreateTaskBulkTransaction: (payload: Payload) => dispatch(createBulkTransaction(payload)),
  dispatchGetNotifications: (payload: Payload) => dispatch(getNotifications(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { taskForBulkTransaction: tasks, isLoading: taskLoading } = state.taskReducer;
  const { user: userDetail } = state.authReducer;
  const { users } = state.userManagementReducer;
  const { status } = state.notificationReducer;
  return { tasks, users, userDetail, taskLoading, status };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(GroupTask);
