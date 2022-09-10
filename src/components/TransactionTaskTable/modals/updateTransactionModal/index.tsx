import { Modal, Typography, Space, Button, Col, Row, ModalProps } from 'antd';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { invert, isEmpty } from 'lodash';
import { connect, ConnectedProps } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';

import { useTranslation } from 'i18next-config';
import { Payload, Transaction } from '@/types';
import { convertToDateJP } from '@/utils/dateJp';
import { CHOICE_IDENTIFIER_005, transactionStatuses } from '@/components/pages/tasks/constants';
import { Field, Form, Label } from '@/components/form';
import { CalendarOutlineIcon } from '@/assets/images';
import LoadingScreen from '@/components/LoadingScreen';
import { getUsers } from '@/redux/actions';
import { mapOptions } from '@/utils/selects';
import { generateCreateUpdateTransactionSchema } from '@/components/pages/tasks/[taskCode]/modal/schema';

import styles from './styles.module.scss';

export type UpdateTransactionModalProps = ModalProps & {
  transaction?: Transaction;
  onCompleteTransaction?: () => void;
};

const UpdateTransactionModal = ({
  transaction,
  user,
  users,
  isUsersLoading,
  isSubmitting,
  onOk,
  onCompleteTransaction,
  dispatchGetUsers,
  ...rest
}: UpdateTransactionModalProps & PropsFromRedux) => {
  const [t] = useTranslation(['task', 'common', 'server_error']);

  const { status, title, startDate, completionDate, memo, practitioner, transactionProcesses } = transaction || {};

  const form = useForm({
    resolver: yupResolver(generateCreateUpdateTransactionSchema(t)),
    defaultValues: {
      status,
      title,
      startDate,
      completionDate,
      memo,
      assignee: user?.id === practitioner ? CHOICE_IDENTIFIER_005.self : CHOICE_IDENTIFIER_005.personInCharge,
      personInCharge: user?.id === practitioner ? '' : practitioner,
      completedProcesses: transactionProcesses.filter(process => process.status).map(process => process.id),
    },
  });

  const { watch, setValue, getValues } = form;
  const watchedAssignee = watch('assignee');

  const statusLabel = invert(transactionStatuses)[watch('status')];

  const handleChangeStatus = () => {
    switch (getValues().status) {
      case transactionStatuses.open:
        return setValue('status', transactionStatuses.doing);
      case transactionStatuses.doing:
        return setValue('status', transactionStatuses.open);
      case transactionStatuses.completed:
        return setValue('status', transactionStatuses.doing);
      default:
        return null;
    }
  };

  const handleSubmit = values => {
    onOk({
      ...values,
      practitioner: values.assignee === CHOICE_IDENTIFIER_005.self ? user.id : values.personInCharge,
      processes: transactionProcesses.map(process => ({
        id: process.id,
        status: values.completedProcesses.includes(process.id),
      })),
    });
  };

  useEffect(() => {
    if (isEmpty(users) && watchedAssignee === CHOICE_IDENTIFIER_005.personInCharge) {
      dispatchGetUsers({
        params: {
          organizationIds: [transaction?.task?.organizationId],
        },
      });
    }
  }, [dispatchGetUsers, transaction?.task?.organizationId, users, watchedAssignee]);

  return (
    <>
      <LoadingScreen />
      <Modal
        width={600}
        className={styles['transaction-modal']}
        title={
          <>
            <span className={classNames(styles['transaction-status-label'], styles[`transaction-status-label--${statusLabel}`])}>
              {t(`common:transaction_status_${statusLabel}`)}
            </span>
          </>
        }
        footer={false}
        {...rest}
      >
        <Form form={form} onSubmit={handleSubmit}>
          <Field type="hidden" name="status" />
          <Row gutter={10} justify="end" className={classNames(styles['status-group'], 'mb-1')}>
            {watch('status') === transactionStatuses.completed ? (
              <Col>
                <Button type="primary" className={styles['header-button']} onClick={handleChangeStatus}>
                  {t('uncomplete')}
                </Button>
              </Col>
            ) : (
              <>
                <Col>
                  <Button className={styles['header-button']} onClick={handleChangeStatus}>
                    {watch('status') === transactionStatuses.open
                      ? t('home:button_change_transaction_status_to_doing')
                      : t('home:button_change_transaction_status_to_open')}
                  </Button>
                </Col>
                <Col>
                  <Button type="primary" className={styles['header-button']} onClick={onCompleteTransaction}>
                    {t('home:button_change_transaction_status_to_completed')}
                  </Button>
                </Col>
              </>
            )}
          </Row>
          <Typography.Title level={2} className="ant-modal-title">
            {t('work_record')}
          </Typography.Title>
          <Typography.Paragraph className={classNames(styles['field-label'])}>
            {t('work_record_with_year', { year: convertToDateJP(transaction?.startDate, 'reiwa') })}
          </Typography.Paragraph>
          {transaction?.status === transactionStatuses.completed && (
            <div className={styles['notification-label']}>
              <Typography.Text strong>{t('process_complete_message')}</Typography.Text>
            </div>
          )}
          <Label strong>{t('subject')}</Label>
          <Field type="text" name="title" size="large" className="mb-3" />
          <Row gutter={[32, 12]} className="mb-3">
            <Col xs={24} sm={9}>
              <Label strong>{t('start_date')}</Label>
              <Field
                type="datePicker"
                name="startDate"
                size="large"
                format={value => convertToDateJP(value, 'dateOnly')}
                suffixIcon={<CalendarOutlineIcon />}
              />
            </Col>
            <Col xs={24} sm={9}>
              <Label strong>{t('end_date')}</Label>
              <Field
                type="datePicker"
                name="completionDate"
                size="large"
                format={value => convertToDateJP(value, 'dateOnly')}
                suffixIcon={<CalendarOutlineIcon />}
              />
            </Col>
          </Row>
          <Label strong>{t('assignee')}</Label>
          <Field
            type="radioGroup"
            name="assignee"
            options={[
              {
                label: t('task__do_by_owner'),
                value: 0,
              },
              {
                label: t('task__do_by_others'),
                value: 1,
              },
            ]}
            className="radio-color-green mb-3"
            direction="vertical"
          />
          {watchedAssignee === CHOICE_IDENTIFIER_005.personInCharge && (
            <Field
              type="select"
              loading={isUsersLoading}
              showSearch
              name="personInCharge"
              size="large"
              className={styles.select}
              options={mapOptions(users, { labelKey: 'name', valueKey: 'id' })}
            />
          )}
          {watch('status') !== transactionStatuses.completed && (
            <>
              <Label strong className="mt-4">
                {t('transaction_process_infor', { total: transaction?.transactionProcesses?.length, done: 0 })}
              </Label>
              <div className={styles['transaction-process']}>
                {transaction?.transactionProcesses?.length ? (
                  <Field
                    type="checkboxGroup"
                    name="completedProcesses"
                    direction="vertical"
                    options={transaction?.transactionProcesses?.map((process, index) => ({
                      value: process.id,
                      label: (
                        <>
                          <span className={styles['transaction-process-order-no']}>{index + 1}.</span>
                          <span>{process.content}</span>
                        </>
                      ),
                    }))}
                  />
                ) : (
                  t('common:task_no_process_message')
                )}
              </div>
            </>
          )}
          <Label strong>{t('memo')}</Label>
          <Field type="textArea" name="memo" className={classNames(styles.textarea, 'mb-3')} />
          <Space align="center" direction="vertical" className="w-100 mt-2">
            <Button size="large" type="primary" htmlType="submit" className="mn-w180p font-weight-bold" loading={isSubmitting}>
              {t('common:button_update')}
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

const mapStateToProps = state => {
  const { user } = state.authReducer;
  const { users, isLoading: isUsersLoading } = state.userManagementReducer;
  const { isSubmitting } = state.taskReducer;
  return { user, users, isUsersLoading, isSubmitting };
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGetUsers: (payload: Payload) => dispatch(getUsers(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(UpdateTransactionModal);
