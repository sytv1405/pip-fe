import React, { useCallback, useEffect, useRef } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Spin, Typography } from 'antd';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { Dispatch } from 'redux';

import { TodoIcon } from '@/assets/images';
import { updateTransactionProcessStatus } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import { Action, Objectliteral, Payload, Transaction, TransactionProcess } from '@/types';
import { convertToDateJP } from '@/utils/dateJp';
import { numberSorter } from '@/utils/sortUtils';

import { transactionStatuses } from '../../constants';
import styles from '../styles.module.scss';
import { ModalProps, TaskModalTypes } from '../types';

interface TransactionItemProps extends PropsFromRedux {
  transaction: Transaction;
  transactionIdQuery?: string;
  t: (key: string, options?: Objectliteral) => string;
  setModal: (modalProps: ModalProps) => void;
  isDisabledAction?: boolean;
}

const TransactionItem = ({
  transaction,
  transactionIdQuery,
  t,
  setModal,
  transactionProcessLoading,
  dispatchUpdateTransactionProcessStatus,
  isDisabledAction,
  taskDetail,
}: TransactionItemProps) => {
  const focusElementRef = useRef(null);

  const handleUpdateTransactionStatus = useCallback(
    (transactionId, transactionProcessId, status) => {
      if (isDisabledAction) {
        return;
      }
      dispatchUpdateTransactionProcessStatus({ params: { transactionId, transactionProcessId, status } });
    },
    [dispatchUpdateTransactionProcessStatus, isDisabledAction]
  );

  useEffect(() => {
    if (focusElementRef?.current) {
      focusElementRef?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [focusElementRef?.current]);

  return (
    <div
      {...{ ...(transaction.id === +transactionIdQuery ? { ref: focusElementRef } : {}) }}
      id={`transaction-${transaction.id}`}
      className={styles['item-modal-transaction']}
    >
      <div className={styles['item-transaction__status']}>
        {transaction?.status === transactionStatuses.open && (
          <span className={styles['item-transaction__status--open']}>{t('common:transaction_status_open')}</span>
        )}
        {transaction?.status === transactionStatuses.doing && (
          <span className={styles['item-transaction__status--doing']}>{t('common:transaction_status_doing')}</span>
        )}
        {transaction?.status === transactionStatuses.completed && (
          <span className={styles['item-transaction__status--completed']}>{t('common:transaction_status_completed')}</span>
        )}
      </div>

      <div className={classNames(styles['display-btn-transaction'], 'd-flex')}>
        <Button
          className={classNames(styles['btn-transaction-edit'], styles['btn-transaction'], 'mn-w90p mr-3 font-weight-medium')}
          type="link"
          onClick={() =>
            setModal({
              type: TaskModalTypes.UpdateTransaction,
              onCancel: () => setModal(null),
              transaction,
              task: taskDetail,
            })
          }
        >
          {t('button_edit_transaction')}
        </Button>
        <Button
          className={classNames(styles['btn-transaction-get'], styles['btn-transaction'], 'mn-w90p font-weight-bold')}
          type="link"
          onClick={() =>
            setModal({
              type: TaskModalTypes.CompleteTransaction,
              onCancel: () => setModal(null),
              transaction,
              task: taskDetail,
            })
          }
        >
          {transaction.status === transactionStatuses.completed ? t('button_resume_transaction') : t('button_complete_transaction')}
        </Button>
      </div>

      <div className={styles['title-transaction__modal']}>
        <Typography.Title level={4}>{transaction?.title}</Typography.Title>
        <div className="d-flex">
          <div className={styles['item-infor-transaction']}>
            <span>{t('start_date')}</span>
            <span>{convertToDateJP(transaction?.startDate, 'dateOnly')}</span>
          </div>
          <div className={styles['item-infor-transaction']}>
            <span>{t('end_date')}</span>
            <span>{convertToDateJP(transaction?.completionDate, 'dateOnly')}</span>
          </div>
          <div className={styles['item-infor-transaction']}>
            <span>{t('assignee')}</span>
            <span>{transaction?.owner?.name}</span>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <Typography.Text className="font-weight-bold">
          {transaction?.status === transactionStatuses.completed ? (
            `${t('reason_complete')}${
              transaction?.reason ? t(`transaction_reason_${transaction?.reason.toLowerCase()}`) : t('not_select_reason')
            }`
          ) : (
            <>
              {transaction?.transactionProcesses?.length
                ? t('transaction_process_infor', {
                    total: transaction?.transactionProcesses?.length,
                    done: transaction?.transactionProcesses?.filter(e => e.status)?.length,
                  })
                : t('procedure_not_registered')}
            </>
          )}
        </Typography.Text>
      </div>
      <div
        className={
          transaction?.status === transactionStatuses.completed
            ? styles['table-task-work-record-complete']
            : styles['table-task-work-record-inprogress']
        }
      >
        {transaction?.transactionProcesses
          ?.sort((record1, record2) => numberSorter(record1.orderNo, record2.orderNo))
          ?.map((transactionProcess: TransactionProcess, pIndex: number) => (
            <div key={transactionProcess.id} className="p-2">
              <Checkbox
                name={`transactionProcess.${pIndex}`}
                checked={transactionProcess.status}
                disabled={
                  transactionProcessLoading[transactionProcess.id] ||
                  isDisabledAction ||
                  transaction?.status === transactionStatuses.completed
                }
                onChange={() => handleUpdateTransactionStatus(transaction.id, transactionProcess.id, !transactionProcess.status)}
              >
                {pIndex + 1}. {transactionProcess.content}
              </Checkbox>
              {transactionProcessLoading[transactionProcess.id] && <Spin size="small" indicator={<LoadingOutlined spin />} />}
            </div>
          ))}
      </div>

      <div className={classNames(styles['procedure-note'], 'd-flex mt-3')}>
        <TodoIcon />
        <div className="ml-2 text-pre-line">{transaction?.memo}</div>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchUpdateTransactionProcessStatus: (payload: Payload) => dispatch(updateTransactionProcessStatus(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { taskDetail = {} as any, transactionProcessLoading } = state.taskReducer;
  return { taskDetail, transactionProcessLoading };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(TransactionItem);
