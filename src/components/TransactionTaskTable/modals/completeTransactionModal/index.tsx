import React from 'react';
import { Button, Col, ModalProps, Row, Space, Typography } from 'antd';
import classNames from 'classnames';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { connect, ConnectedProps } from 'react-redux';
import { invert } from 'lodash';

import { ModalInfo } from '@/components/modal';
import { useTranslation } from 'i18next-config';
import { convertToDateJP } from '@/utils/dateJp';
import { Field, Form, Label } from '@/components/form';
import { Transaction } from '@/types';
import { convertObjectToOptions } from '@/utils/convertUtils';
import { COMPLETE_TRANSACTION_REASON, transactionStatuses } from '@/components/pages/tasks/constants';

import styles from './styles.module.scss';

export type CompleteTransactionModalProps = ModalProps & {
  transaction: Transaction;
};

const CompleteTransactionModal = ({ transaction, isSubmitting, onOk, ...rest }: CompleteTransactionModalProps & PropsFromRedux) => {
  const [t] = useTranslation(['task', 'common']);

  const form = useForm({
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
    },
  });

  const statusLabel = invert(transactionStatuses)[transaction.status];

  const handleSubmit = values => {
    onOk({
      ...values,
      status: transactionStatuses.completed,
    });
  };

  return (
    <ModalInfo
      title={
        <>
          <span className={classNames(styles['transaction-status-label'], styles[`transaction-status-label--${statusLabel}`])}>
            {t(`common:transaction_status_${statusLabel}`)}
          </span>
          <div className="mt-4">{t('work_record')}</div>
        </>
      }
      width={600}
      className={styles['transaction-modal']}
      footer={null}
      {...rest}
    >
      <Label strong>{t('work_record_with_year', { year: convertToDateJP(transaction?.startDate, 'reiwa') })}</Label>
      <div className={styles['notification-label']}>
        <Typography.Text strong>{t('label_complete_transaction')}</Typography.Text>
      </div>
      <div className={styles['transaction-infor']}>
        <Row className={styles['transaction-infor__row']}>
          <Col flex="0 0 65px">
            <div className={styles['transaction-infor__title']}>{t('subject')}</div>
          </Col>
          <Col flex="1">
            <div className={styles['transaction-infor__text']}>{transaction?.title}</div>
          </Col>
        </Row>
        <Row className={styles['transaction-infor__row']}>
          <Col flex="0 0 65px">
            <div className={styles['transaction-infor__title']}>{t('start_date')}</div>
          </Col>
          <Col flex="1">
            <div className={styles['transaction-infor__text']}>{convertToDateJP(transaction?.startDate, 'dateOnly')}</div>
          </Col>
        </Row>
        <Row className={styles['transaction-infor__row']}>
          <Col flex="0 0 65px">
            <div className={styles['transaction-infor__title']}>{t('end_date')}</div>
          </Col>
          <Col flex="1">
            <div className={styles['transaction-infor__text']}>{convertToDateJP(transaction?.completionDate, 'dateOnly')}</div>
          </Col>
        </Row>
        <Row className={styles['transaction-infor__row']}>
          <Col flex="0 0 65px">
            <div className={classNames(styles['transaction-infor__title'], 'mb-0')}>{t('assignee')}</div>
          </Col>
          <Col flex="1">
            <div className={classNames(styles['transaction-infor__text'], 'mb-0')}>{transaction?.owner?.name}</div>
          </Col>
        </Row>
      </div>
      <Form form={form} onSubmit={handleSubmit}>
        <Label strong>{t('reason_label')}</Label>
        <Field
          type="select"
          name="reason"
          options={convertObjectToOptions(COMPLETE_TRANSACTION_REASON, {
            transformKey: key => t(`transaction_reason_${key}`),
          })}
          size="large"
          className={classNames(styles.select, 'mb-4')}
        />
        <Label strong>{t('memo')}</Label>
        <Field type="textArea" name="memo" className={classNames(styles.textarea, 'mb-3')} />
        <Space align="center" direction="vertical" className="w-100 mt-2">
          <Button size="large" type="primary" htmlType="submit" className="mn-w180p font-weight-bold" loading={isSubmitting}>
            {t('button_submit_complete_process')}
          </Button>
        </Space>
      </Form>
    </ModalInfo>
  );
};

const mapStateToProps = state => {
  const { isSubmitting } = state.taskReducer;

  return { isSubmitting };
};

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(CompleteTransactionModal);
