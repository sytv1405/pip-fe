import { useCallback, useMemo, useEffect } from 'react';
import { Input, Modal, Typography, Form, Radio, Space, Button, Select, DatePicker, Row, Col, Checkbox } from 'antd';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { debounce, invert } from 'lodash';
import moment from 'moment';
import { connect, ConnectedProps } from 'react-redux';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { RootState } from '@/redux/rootReducer';
import { Objectliteral, Payload, Task } from '@/types';
import { createTaskTransaction, getTransactions, getUsers } from '@/redux/actions';
import { convertToDateJP } from '@/utils/dateJp';
import { getKeyByValue } from '@/utils/selects';
import message from '@/utils/message';
import { CalendarOutlineIcon, DownIcon } from '@/assets/images';

import { CHOICE_IDENTIFIER_005, leadTimeTypes, transactionStatuses } from '../../constants';

import styles from './styles.module.scss';
import { generateCreateUpdateTransactionSchema } from './schema';

interface ModalCreateTransactionProps extends PropsFromRedux {
  visible: boolean;
  onOk?: () => void;
  onCancel: () => void;
  task?: Task;
}

const ModalCreateTransaction = ({
  onOk,
  onCancel,
  dispatchGetUsers,
  users,
  isSearching,
  dispatchCreateTaskTransaction,
  currentUserId,
  isSubmitting,
  dispatchGetTransactions,
  task,
  ...rest
}: ModalCreateTransactionProps) => {
  const [t] = useTranslation(['task', 'common', 'server_error']);

  const [form] = Form.useForm();
  const { control, handleSubmit, watch, setValue } = useForm({
    resolver: yupResolver(generateCreateUpdateTransactionSchema(t)),
    defaultValues: {
      startDate: new Date(),
      assignee: CHOICE_IDENTIFIER_005.self,
      title: task?.title,
      completionDate: task?.leadTimeDay
        ? moment().add(task?.leadTimeDay, (getKeyByValue(leadTimeTypes, task?.leadTimeType) as any) || 'days')
        : null,
      personInCharge: '',
      memo: '',
      status: transactionStatuses.open,
    } as Objectliteral,
  });

  const onSubmitHandler = useCallback(
    data => {
      const { assignee, personInCharge, startDate, completionDate, ...restData } = data;
      dispatchCreateTaskTransaction({
        params: {
          ...restData,
          taskId: task?.id,
          practitioner: +assignee === CHOICE_IDENTIFIER_005.self ? currentUserId : personInCharge,
          startDate: startDate ? moment(startDate).startOf('day') : new Date(),
          completionDate: completionDate ? moment(completionDate).endOf('day') : null,
        },
        callback: () => {
          dispatchGetTransactions({ params: { taskId: task?.id } });
          message.success(t('create_transaction_successfully'));
          onCancel();
        },
      });
    },
    [dispatchCreateTaskTransaction, task?.id, currentUserId, dispatchGetTransactions, t, onCancel]
  );

  const assignee = watch('assignee');

  const statusLabel = invert(transactionStatuses)[watch('status')];

  const assignOptions = useMemo(() => (users || []).map(user => ({ value: user.id, label: user.name })), [users]);

  const onSearchHandler = useCallback(
    (keyword: string) => {
      dispatchGetUsers({ params: { keyword, organizationIds: [task.organizationId] } });
    },
    [dispatchGetUsers, task.organizationId]
  );

  const debouncedSearchHandler = useMemo(() => debounce(onSearchHandler, 500), [onSearchHandler]);

  useEffect(() => {
    if (+assignee === CHOICE_IDENTIFIER_005.self) {
      dispatchGetUsers({ params: { organizationIds: [task.organizationId] } });
    }
  }, [dispatchGetUsers, assignee, task.organizationId]);

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
      onCancel={onCancel}
      {...rest}
      footer={false}
    >
      <Typography.Paragraph className={styles['field-label']}>
        {t('work_record_with_year', { year: convertToDateJP(new Date(), 'reiwa') })}
      </Typography.Paragraph>
      <div className={styles['notification-label']}>
        <Typography.Text strong>{t('label_create_transaction')}</Typography.Text>
      </div>
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
          <Col xs={24} sm={9}>
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
          <Col xs={24} sm={9}>
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
                  className={styles['start-select-task']}
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
          name="status"
          render={({ field, fieldState: { error } }) => (
            <Form.Item className="border-input" validateStatus={error?.message ? 'error' : ''} label={t('common:status')}>
              <Checkbox
                {...field}
                onChange={e => {
                  setValue('status', e.target.checked ? transactionStatuses.doing : transactionStatuses.open);
                }}
                checked={field.value === transactionStatuses.doing}
              >
                {t('checkbox_create_transaction_status_doing')}
              </Checkbox>
              {error?.message && <Typography.Text className="color-red">{error?.message}</Typography.Text>}
            </Form.Item>
          )}
        />
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
            className="font-weight-bold mn-w180p"
            size="large"
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmitHandler)}
          >
            {t('modal_start_task_submit')}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGetUsers: (payload: Payload) => dispatch(getUsers(payload)),
  dispatchCreateTaskTransaction: (payload: Payload) => dispatch(createTaskTransaction(payload)),
  dispatchGetTransactions: (payload: Payload) => dispatch(getTransactions(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { users, isLoading: isSearching } = state.userManagementReducer;
  const { user } = state.authReducer;
  const { isSubmitting } = state.taskReducer;
  return { users, isSearching, currentUserId: user?.id, isSubmitting };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ModalCreateTransaction);
