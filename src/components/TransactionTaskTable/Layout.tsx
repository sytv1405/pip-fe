import { Col, Row, Table, Typography, Grid } from 'antd';
import React, { FC, useCallback, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { isEmpty, invert } from 'lodash';
import moment from 'moment';
import { connect, ConnectedProps } from 'react-redux';

import { paths } from '@/shared/paths';
import { Payload, Task, Transaction } from '@/types';
import { useTranslation } from 'i18next-config';
import { ExclamationIcon, ExternalIcon, StarFilledIcon, StarOutlineIcon } from '@/assets/images';
import { getTaskPeriod } from '@/shared/calendar';
import { getCategorySeparatorOfTable, getTableTitleWithSort } from '@/shared/table';
import { markTaskFavorite, markTransactionFavorite, updateTaskTransaction } from '@/redux/actions';
import message from '@/utils/message';

import { transactionStatuses } from '../pages/tasks/constants';
import { Spacer } from '../Spacer';

import UpdateTransactionModal, { UpdateTransactionModalProps } from './modals/updateTransactionModal';
import styles from './styles.module.scss';
import CompleteTransactionModal, { CompleteTransactionModalProps } from './modals/completeTransactionModal';

const MODAL_TYPES = {
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  COMPLETE_TRANSACTION: 'COMPLETE_TRANSACTION',
};

const { useBreakpoint } = Grid;

export type Props = {
  transactions?: Transaction[] | Task[];
  onStarCallback?: (payload: Payload) => void;
  updateTransactionCallback?: () => void;
  backUrl?: string;
  isFavorite?: boolean;
};

const Layout: FC<Props & PropsFromRedux> = ({
  transactions,
  onStarCallback,
  updateTransactionCallback,
  dispatchMarkTransactionFavorite,
  dispatchMarkTaskFavorite,
  dispatchUpdateTaskTransaction,
  backUrl = paths.home,
  isFavorite,
}) => {
  const [t] = useTranslation('home');
  const router = useRouter();
  const screens = useBreakpoint();

  const [modal, setModal] = useState<UpdateTransactionModalProps & CompleteTransactionModalProps & { type: string }>(null);

  const getDeadline = useCallback(
    (record: Transaction | Task) => {
      let task = {} as Task;
      let transaction = {} as Transaction;

      if ((record as Transaction).task) {
        task = (record as Transaction).task;
        transaction = record as Transaction;
      } else {
        task = record as Task;
        transaction = null;
      }

      return getTaskPeriod(task, t, transaction, true) || t('not_setting_due_date');
    },
    [t]
  );

  const handleStar = useCallback(
    (record: Task | Transaction) => {
      const isTransaction = 'task' in record;

      if (isTransaction) {
        onStarCallback?.({ params: { transactionId: record.id } });
        dispatchMarkTransactionFavorite({ params: { id: record.id } });
      } else {
        onStarCallback?.({ params: { taskId: record.id } });
        dispatchMarkTaskFavorite({ params: { id: record.id } });
      }
    },
    [onStarCallback, dispatchMarkTaskFavorite, dispatchMarkTransactionFavorite]
  );

  const handleOpenTransactionModal = useCallback(record => {
    const isTransaction = !!record.task;

    if (isTransaction) {
      setModal({
        type: MODAL_TYPES.UPDATE_TRANSACTION,
        transaction: record,
      });
    }
  }, []);

  const columns = useCallback(() => {
    return [
      {
        dataIndex: 'status',
        title: value => getTableTitleWithSort(value, 'status', t('todo_list__column_status')),
        render: (_, record) => {
          let statusText = '';
          // case: record variable having `task` in it's value is transaction
          if (record?.task) {
            statusText = t(`common:transaction_status_${invert(transactionStatuses)[record.status]}`);
          } else {
            statusText = t('task_status_open');
          }

          return (
            <div className="status-box">
              <p
                className={classNames(
                  'text',
                  { 'transaction-open': record?.task && record.status === transactionStatuses.open },
                  { 'transaction-doing': record?.task && record.status === transactionStatuses.doing },
                  { 'transaction-completed': record?.task && record.status === transactionStatuses.completed },
                  { 'task-open': !record?.task }
                )}
              >
                {statusText}
              </p>
            </div>
          );
        },
        sorter: (a, b) => (a?.status?.toString() ?? '').localeCompare(b?.status?.toString() ?? ''),
        keepInMobile: false,
      },
      {
        dataIndex: 'title',
        title: value => getTableTitleWithSort(value, 'title', t('todo_list__column_task_name')),
        render: (_, record) => {
          return (
            <Row justify="space-between" align="middle" className="task--name">
              <Col>
                {record.owner ? (
                  <button
                    className={styles['button-open-transaction-modal']}
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenTransactionModal(record);
                    }}
                  >
                    <ExternalIcon className="details--button" />
                  </button>
                ) : (
                  <Spacer width="36px" />
                )}
              </Col>
              <Col className={styles['column-expand']}>
                <Typography.Text className="title font-weight-bold">{record?.title}</Typography.Text>
                <br />
                <Typography.Text className="category">
                  {(record.task
                    ? [record?.task?.majorCategory?.name, record?.task?.middleCategory?.name, record?.task?.minorCategory?.name]
                    : [record?.majorCategory?.name, record?.middleCategory?.name, record?.minorCategory?.name]
                  )
                    .filter(Boolean)
                    .map((item, index, array) => {
                      const templete = (
                        <>
                          <span>{item}</span>
                          {index + 1 < array.length ? getCategorySeparatorOfTable() : ''}
                        </>
                      );
                      return templete;
                    })}
                </Typography.Text>
              </Col>
              <Col>
                <button
                  className={styles['button-star']}
                  onClick={e => {
                    e.stopPropagation();
                    handleStar(record);
                  }}
                >
                  {!isEmpty(record.favoriteTasks) || !isEmpty(record.favoriteTransactions) ? (
                    <StarFilledIcon />
                  ) : (
                    <StarOutlineIcon className="favorite--button" />
                  )}
                </button>
              </Col>
            </Row>
          );
        },
        sorter: (a, b) => (a?.title ?? '').localeCompare(b.title),
        keepInMobile: true,
      },
      {
        dataIndex: 'deadline',
        title: value => getTableTitleWithSort(value, 'deadline', t('todo_list__column_deadline')),
        render: (_, record) => {
          const isOverDueDate = record.completionDate ? moment().isAfter(record.completionDate, 'day') : false;

          return (
            <Typography.Text className={`task--deadline ${isOverDueDate && 'over-due'}`}>
              {getDeadline(record)}
              {isOverDueDate && <ExclamationIcon className="ml-1" />}
            </Typography.Text>
          );
        },
        sorter: (a, b) => (getDeadline(a) ?? '').localeCompare(getDeadline(b) ?? ''),
        keepInMobile: true,
      },
      {
        dataIndex: 'performer',
        title: value => getTableTitleWithSort(value, 'performer', t('todo_list_column_performer')),
        render: (_, record) => (
          <Typography.Text className="d-inline-flex align-items-center">
            {record?.owner?.name || (
              <>
                {t('not_setting_owner')}
                <ExclamationIcon className="ml-1" />
              </>
            )}
          </Typography.Text>
        ),
        sorter: (a, b) => (a?.owner?.name ?? '').localeCompare(b.owner?.name ?? ''),
        keepInMobile: false,
      },
    ].filter(item => screens.md || item.keepInMobile);
  }, [t, handleStar, handleOpenTransactionModal, getDeadline, screens.md]);

  return (
    <div className={styles['ssc--home--todo--list']}>
      {transactions?.length ? (
        <Table
          columns={columns()}
          dataSource={transactions}
          pagination={false}
          showSorterTooltip={false}
          className="ssc-table ssc-table-brown custom-sort-icon cursor-pointer"
          onRow={record => ({
            onClick: () => {
              router.push({
                pathname: paths.tasks.detail,
                query: { taskCode: record?.task?.taskCode ?? record?.taskCode, backUrl, transactionId: record?.task && record?.id },
              });
            },
          })}
        />
      ) : (
        <div className={styles['nodata-indication']}>{t(isFavorite ? 'no_favorite_data' : 'business_task_nodata')}</div>
      )}
      {modal?.type === MODAL_TYPES.UPDATE_TRANSACTION && (
        <UpdateTransactionModal
          visible
          onCancel={() => setModal(null)}
          {...modal}
          onCompleteTransaction={() => {
            setModal({
              type: MODAL_TYPES.COMPLETE_TRANSACTION,
              transaction: modal?.transaction,
              onOk: params =>
                dispatchUpdateTaskTransaction({
                  params: {
                    taskId: modal?.transaction?.task?.id,
                    id: modal?.transaction?.id,
                    ...params,
                  },
                  callback: () => {
                    message.success(t('common:message_complete_transaction_success'));
                    updateTransactionCallback();
                    setModal(null);
                  },
                }),
            });
          }}
          onOk={params => {
            dispatchUpdateTaskTransaction({
              params: {
                taskId: modal?.transaction?.task?.id,
                id: modal?.transaction?.id,
                ...params,
              },
              callback: () => {
                message.success(t('common:message_update_transaction_success'));
                updateTransactionCallback();
                setModal(null);
              },
            });
          }}
        />
      )}
      {modal?.type === MODAL_TYPES.COMPLETE_TRANSACTION && <CompleteTransactionModal visible onCancel={() => setModal(null)} {...modal} />}
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  dispatchMarkTaskFavorite: (payload: Payload) => dispatch(markTaskFavorite(payload)),
  dispatchMarkTransactionFavorite: (payload: Payload) => dispatch(markTransactionFavorite(payload)),
  dispatchUpdateTaskTransaction: (payload: Payload) => dispatch(updateTaskTransaction(payload)),
});

const connector = connect(null, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
