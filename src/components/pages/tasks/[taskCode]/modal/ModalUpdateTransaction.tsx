import { useEffect, useMemo, useCallback } from 'react';
import { Input, Modal, Typography, Form, Radio, Space, Button, Select, DatePicker, Row, Col } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import moment from 'moment';
import { yupResolver } from '@hookform/resolvers/yup';
import { connect, ConnectedProps } from 'react-redux';
import { debounce, invert } from 'lodash';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { Payload, Task, Transaction } from '@/types';
import { getNotifications, getTransactions, getUsers, updateTaskTransaction } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import { convertToDateJP } from '@/utils/dateJp';
import message from '@/utils/message';
import { CalendarOutlineIcon, DownIcon } from '@/assets/images';
import { PAGINATE_NOTIFICATIONS } from '@/shared/constants';

import { CHOICE_IDENTIFIER_005, transactionStatuses } from '../../constants';

import styles from './styles.module.scss';
import { generateCreateUpdateTransactionSchema } from './schema';

interface ModalUpdateTransactionProps extends PropsFromRedux {
  visible: boolean;
  onOk?: () => void;
  onCancel: () => void;
  transaction?: Transaction;
  task?: Task;
  onCompleteTransaction?: () => void;
}

const ModalUpdateTransaction = ({
  visible,
  onOk,
  onCancel,
  transaction,
  dispatchGetUsers,
  users,
  isSearching,
  dispatchUpdateTaskTransaction,
  dispatchGetNotifications,
  currentUserId,
  isSubmitting,
  dispatchGetTransactions,
  onCompleteTransaction,
  task,
  status,
}: ModalUpdateTransactionProps) => {
  const [t] = useTranslation(['task', 'common', 'server_error']);
  const [form] = Form.useForm();
  const { control, handleSubmit, watch, getValues, setValue } = useForm({
    resolver: yupResolver(generateCreateUpdateTransactionSchema(t)),
    defaultValues: {
      startDate: transaction?.startDate,
      completionDate: transaction?.completionDate,
      title: transaction?.title,
      memo: transaction?.memo,
      practitioner: transaction?.owner?.id,
      assignee: currentUserId === transaction?.owner?.id ? CHOICE_IDENTIFIER_005.self : CHOICE_IDENTIFIER_005.personInCharge,
      personInCharge: currentUserId === transaction?.owner?.id ? '' : transaction?.owner?.id,
      status: transaction?.status,
    },
  });

  const onSubmitHandler = useCallback(
    data => {
      const { assignee, personInCharge, startDate, completionDate, ...rest } = data;
      dispatchUpdateTaskTransaction({
        params: {
          ...rest,
          id: transaction?.id,
          taskId: task?.id,
          practitioner: +assignee === CHOICE_IDENTIFIER_005.self ? currentUserId : personInCharge,
          startDate: startDate ? moment(startDate).startOf('day') : new Date(),
          completionDate: completionDate ? moment(completionDate).endOf('day') : null,
        },
        callback: () => {
          dispatchGetTransactions({ params: { taskId: task?.id } });
          dispatchGetNotifications({
            params: {
              offset: PAGINATE_NOTIFICATIONS.offset,
              limit: PAGINATE_NOTIFICATIONS.limit,
              page: PAGINATE_NOTIFICATIONS.page,
              isForceRefresh: true,
              status,
            },
          });
          message.success(t('update_transaction_successfully'));
          onCancel();
        },
      });
    },
    [
      dispatchUpdateTaskTransaction,
      transaction?.id,
      task?.id,
      currentUserId,
      dispatchGetTransactions,
      dispatchGetNotifications,
      status,
      t,
      onCancel,
    ]
  );

  const assignee = watch('assignee');

  const statusLabel = invert(transactionStatuses)[watch('status')];

  const assignOptions = useMemo(() => (users || []).map(user => ({ value: user.id, label: user.name })), [users]);

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

  const onSearchHandler = useCallback(
    (keyword: string) => {
      dispatchGetUsers({ params: { keyword, organizationIds: [task.organizationId] } });
    },
    [dispatchGetUsers, task.organizationId]
  );

  const debouncedSearchHandler = useMemo(() => debounce(onSearchHandler, 500), [onSearchHandler]);

  useEffect(() => {
    dispatchGetUsers({ params: { organizationIds: [task.organizationId] } });
  }, [dispatchGetUsers, task.organizationId]);

  return (
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
      visible={visible}
      onCancel={onCancel}
      footer={false}
    >
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
      <Typography.Paragraph
        className={classNames(styles['field-label'], { 'mb-1': transaction?.status === transactionStatuses.completed })}
      >
        {t('work_record_with_year', { year: convertToDateJP(transaction?.startDate, 'reiwa') })}
      </Typography.Paragraph>
      {transaction?.status === transactionStatuses.completed && (
        <div className={styles['notification-label']}>
          <Typography.Text strong>{t('process_complete_message')}</Typography.Text>
        </div>
      )}
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Controller
          control={control}
          name="title"
          render={({ field, fieldState: { error } }) => (
            <Form.Item className="border-input" validateStatus={error?.message ? 'error' : ''} label={t('subject')}>
              <Input size="large" {...field} />
              {error?.message && <Typography.Text className="color-red">{error?.message}</Typography.Text>}
            </Form.Item>
          )}
        />
        <Row gutter={32}>
          <Col sm={9} xs={24}>
            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState: { error } }) => (
                <Form.Item className="border-input" validateStatus={error?.message ? 'error' : ''} label={t('start_date')}>
                  <DatePicker
                    format={value => convertToDateJP(value, 'dateOnly')}
                    className="w-100"
                    {...field}
                    value={field.value ? moment(field.value) : undefined}
                    size="large"
                    suffixIcon={<CalendarOutlineIcon />}
                  />
                  {error?.message && <Typography.Text className="color-red text-pre-line">{error?.message}</Typography.Text>}
                </Form.Item>
              )}
            />
          </Col>
          <Col sm={9} xs={24}>
            <Controller
              control={control}
              name="completionDate"
              render={({ field, fieldState: { error } }) => (
                <Form.Item className="border-input" validateStatus={error?.message ? 'error' : ''} label={t('end_date')}>
                  <DatePicker
                    format={value => convertToDateJP(value, 'dateOnly')}
                    className="w-100"
                    {...field}
                    value={field.value ? moment(field.value) : undefined}
                    size="large"
                    suffixIcon={<CalendarOutlineIcon />}
                  />
                  {error?.message && <Typography.Text className="color-red">{error?.message}</Typography.Text>}
                </Form.Item>
              )}
            />
          </Col>
        </Row>
        <Form.Item label={t('assignee')}>
          <Controller
            control={control}
            name="assignee"
            render={({ field: { onChange, value } }) => (
              <Radio.Group className="radio-color-green" onChange={onChange} value={value}>
                <Space direction="vertical">
                  <Radio value={0}>{t('task__do_by_owner')}</Radio>
                  <Radio value={1}>{t('task__do_by_others')}</Radio>
                </Space>
              </Radio.Group>
            )}
          />
        </Form.Item>
        {+assignee === CHOICE_IDENTIFIER_005.personInCharge && (
          <Controller
            control={control}
            name="personInCharge"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Form.Item className="border-input" validateStatus={error?.message ? 'error' : ''}>
                <Select
                  onSelect={onChange}
                  onDeselect={onChange}
                  value={value}
                  onSearch={debouncedSearchHandler}
                  loading={isSearching}
                  showSearch
                  filterOption={false}
                  defaultActiveFirstOption={false}
                  options={assignOptions}
                  size="large"
                  suffixIcon={<DownIcon />}
                />
                {error?.message && <Typography.Text className="color-red">{error?.message}</Typography.Text>}
              </Form.Item>
            )}
          />
        )}
        <Controller
          control={control}
          name="memo"
          render={({ field, fieldState: { error } }) => (
            <Form.Item className="border-input" validateStatus={error?.message ? 'error' : ''} label={t('memo')}>
              <Input.TextArea rows={3} {...field} />
              {error?.message && <Typography.Text className="color-red">{error?.message}</Typography.Text>}
            </Form.Item>
          )}
        />
        <Space align="center" direction="vertical" className="w-100 mt-2">
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className={classNames(styles['btn-transaction'], 'mn-w180p')}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmitHandler)}
          >
            {t('common:button_update')}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGetUsers: (payload: Payload) => dispatch(getUsers(payload)),
  dispatchUpdateTaskTransaction: (payload: Payload) => dispatch(updateTaskTransaction(payload)),
  dispatchGetTransactions: (payload: Payload) => dispatch(getTransactions(payload)),
  dispatchGetNotifications: (payload: Payload) => dispatch(getNotifications(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { users, isLoading: isSearching } = state.userManagementReducer;
  const { user } = state.authReducer;
  const { isSubmitting } = state.taskReducer;
  const { status } = state.notificationReducer;
  return { users, isSearching, currentUserId: user?.id, isSubmitting, status };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ModalUpdateTransaction);
