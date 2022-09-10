import { useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input, Modal, Typography, Form, Space, Button, Select, Row, Col } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { connect, ConnectedProps } from 'react-redux';
import classNames from 'classnames';
import { invert } from 'lodash';

import { useTranslation } from 'i18next-config';
import { Payload, Task, Transaction } from '@/types';
import { convertObjectToOptions } from '@/utils/convertUtils';
import { convertToDateJP } from '@/utils/dateJp';
import { getTransactions, updateTaskTransaction } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import { DownIcon } from '@/assets/images';

import { COMPLETE_TRANSACTION_REASON, transactionStatuses } from '../../constants';

import styles from './styles.module.scss';

interface ModalCompleteTransactionProps extends PropsFromRedux {
  visible: boolean;
  onOk?: () => void;
  onCancel: () => void;
  transaction?: Transaction;
  task?: Task;
}

const ModalCompleteTransaction = ({
  visible,
  onOk,
  onCancel,
  transaction,
  dispatchUpdateTaskTransaction,
  isSubmitting,
  dispatchGetTransactions,
  task,
}: ModalCompleteTransactionProps) => {
  const [t] = useTranslation(['task', 'common']);
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        memo: yup
          .string()
          .nullable()
          .max(1000, t('common:message_max_length', { max: 1000 })),
      })
    ),
    defaultValues: {
      memo: transaction?.memo,
      reason: null,
    },
  });

  const statusLabel = invert(transactionStatuses)[transaction.status];

  const onSubmitHandler = useCallback(
    params => {
      dispatchUpdateTaskTransaction({
        params: {
          taskId: task?.id,
          id: transaction?.id,
          status: transaction?.status === transactionStatuses.completed ? transactionStatuses.doing : transactionStatuses.completed,
          ...params,
        },
        callback: () => {
          dispatchGetTransactions({ params: { taskId: task?.id } });
          onCancel();
        },
      });
    },
    [dispatchUpdateTaskTransaction, transaction?.status, transaction?.id, task?.id, dispatchGetTransactions, onCancel]
  );

  return (
    <Modal
      width={600}
      className={styles['transaction-modal']}
      title={
        <>
          <span className={classNames(styles['transaction-status-label'], styles[`transaction-status-label--${statusLabel}`])}>
            {t(`common:transaction_status_${statusLabel}`)}
          </span>
          <div className="mt-4">{t('work_record')}</div>
        </>
      }
      visible={visible}
      onCancel={onCancel}
      footer={false}
    >
      <Typography.Paragraph className={styles['field-label']}>
        {t('work_record_with_year', { year: convertToDateJP(transaction?.startDate, 'reiwa') })}
      </Typography.Paragraph>
      <div className={styles['notification-label']}>
        <Typography.Text strong>
          {transaction.status === transactionStatuses.completed ? t('label_uncomplete_transaction') : t('label_complete_transaction')}
        </Typography.Text>
      </div>
      <div className={styles['transaction-infor']}>
        <Row className={styles['transaction-infor__row']}>
          <Col flex="0 0 65px">
            <div className={styles['transaction-infor__title']}>{t('subject')}</div>
          </Col>
          <Col>
            <div className={styles['transaction-infor__text']}>{transaction?.title}</div>
          </Col>
        </Row>
        <Row className={styles['transaction-infor__row']}>
          <Col flex="0 0 65px">
            <div className={styles['transaction-infor__title']}>{t('start_date')}</div>
          </Col>
          <Col>
            <div className={styles['transaction-infor__text']}>{convertToDateJP(transaction?.startDate, 'dateOnly')}</div>
          </Col>
        </Row>
        <Row className={styles['transaction-infor__row']}>
          <Col flex="0 0 65px">
            <div className={styles['transaction-infor__title']}>{t('end_date')}</div>
          </Col>
          <Col>
            <div className={styles['transaction-infor__text']}>{convertToDateJP(transaction?.completionDate, 'dateOnly')}</div>
          </Col>
        </Row>
        <Row className={styles['transaction-infor__row']}>
          <Col flex="0 0 65px">
            <div className={classNames(styles['transaction-infor__title'], 'mb-0')}>{t('assignee')}</div>
          </Col>
          <Col>
            <div className={classNames(styles['transaction-infor__text'], 'mb-0')}>{transaction?.owner?.name}</div>
          </Col>
        </Row>
      </div>

      <Form layout="vertical" onFinish={onOk}>
        {transaction?.status !== transactionStatuses.completed && (
          <Form.Item className="border-input" label={t('reason_label')}>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={convertObjectToOptions(COMPLETE_TRANSACTION_REASON, {
                    transformKey: key => t(`transaction_reason_${key}`),
                  })}
                  size="large"
                  suffixIcon={<DownIcon />}
                />
              )}
            />
          </Form.Item>
        )}
        <Controller
          name="memo"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Form.Item className="border-input" validateStatus={error?.message ? 'error' : ''} label={t('memo')}>
              <Input.TextArea {...field} />
              {error?.message && <Typography.Text className="color-red">{error?.message}</Typography.Text>}
            </Form.Item>
          )}
        />
        <Space align="center" direction="vertical" className="w-100 mt-2">
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="mn-w180p font-weight-bold"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmitHandler)}
          >
            {transaction?.status === transactionStatuses.completed
              ? t('button_submit_uncomplete_process')
              : t('button_submit_complete_process')}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchUpdateTaskTransaction: (payload: Payload) => dispatch(updateTaskTransaction(payload)),
  dispatchGetTransactions: (payload: Payload) => dispatch(getTransactions(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { isSubmitting } = state.taskReducer;
  return { isSubmitting };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ModalCompleteTransaction);
