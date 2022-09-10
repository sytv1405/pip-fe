import { useCallback, useState } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Row, Select, Table, Typography, Radio } from 'antd';
import { useRouter } from 'next/router';
import { snakeCase } from 'lodash';
import { connect, ConnectedProps } from 'react-redux';
import { Dispatch } from 'redux';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { WithAuth } from '@/components/Roots/WithAuth';
import { convertObjectToOptions } from '@/utils/convertUtils';
import { Action, Payload, Task } from '@/types';
import { bulkUpdateTask } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import { paths } from '@/shared/paths';
import { ModalInfo } from '@/components/modal';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { CircleEmptyIcon, CopyIcon, DownIcon, FileCheckIcon, XIcon } from '@/assets/images';

import { inActivateTaskReasons, taskStatuses } from '../constants';

import styles from './styles.module.scss';

const Layout = ({ tasks, dispatchBulkUpdateTask, isSubmitting, selectedTaskIds }: PropsFromRedux) => {
  const [t] = useTranslation('task');
  const router = useRouter();
  const [isUpdateSuccessVisible, setUpdateSuccessVisible] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        status: yup
          .string()
          .nullable()
          .required(t('common:please_select', { field: t('change_task_status') })),
      })
    ),
    defaultValues: {
      status: '',
      reason: '',
      ids: selectedTaskIds || [],
    },
  });

  const selectedStatus = watch('status');

  const isOrganizationDeleted = useIsOrganizationDeleted();

  const onSubmitHandler = useCallback(
    params => {
      if (isOrganizationDeleted) {
        return;
      }
      const { status, reason, ...rest } = params;
      dispatchBulkUpdateTask({
        params: { ...rest, reason: reason || null, status: status === taskStatuses.active },
        callback: () => setUpdateSuccessVisible(true),
      });
    },
    [dispatchBulkUpdateTask, setUpdateSuccessVisible, isOrganizationDeleted]
  );

  const columns = [
    {
      title: `${t('task_no')}.`,
      dataIndex: 'taskCode',
      key: 'taskCode',
      className: `${classNames(styles['text-title-table'], 'text-wrap')}`,
      width: 150,
      render: (_, record) => (
        <Link passHref href={{ pathname: paths.tasks.detail, query: { taskCode: record.taskCode } }}>
          <a target="_blank" rel="noopener noreferrer" className="text-decoration-none text-common">
            {record.taskCode}
          </a>
        </Link>
      ),
    },
    {
      key: 'title',
      dataIndex: 'title',
      className: `${classNames(styles['text-title-table'], 'font-weight-bold')}`,
      title: t('task_name'),
      render: (text: string) => <div className={classNames(styles['text-task'], 'truncate-three-line text-common')}>{text}</div>,
    },
    {
      title: t('active'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (text: string, record: any) => (
        <div>
          {record?.deletedAt ? <XIcon /> : <CircleEmptyIcon />}
          {text}
        </div>
      ),
    },
  ];

  return (
    <WithAuth title={t('page_bulk_update_task_title')} isContentFullWidth>
      <Button
        className={styles['back-select-page']}
        type="link"
        icon={<LeftOutlined />}
        onClick={() => router.push({ pathname: paths.tasks.selection })}
      >
        {t('button_return_to_update_task')}
      </Button>
      <Row gutter={28}>
        <Col span={12}>
          <Typography.Title className={classNames(styles['bulk-update-title'], 'd-flex align-items-center text-common')} level={4}>
            {' '}
            <FileCheckIcon className="mr-2 section-icon" />
            {t('selected_task_bulk_update')}
          </Typography.Title>
          <Card className="border-none">
            <Table
              className="table-header-center nowrap ssc-table ssc-table-brown ssc-table-tasks"
              columns={columns}
              dataSource={tasks}
              bordered={false}
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Typography.Title className={classNames(styles['bulk-update-title'], 'd-flex align-items-center text-common')} level={4}>
            <CopyIcon className="mr-2 section-icon" />
            {t('title_change_select_task')}
          </Typography.Title>
          <Card className="border-none modal-task-bulk-update">
            <Form layout="vertical">
              <Form.Item
                className="font-weight-bold mb-px-15"
                validateStatus={errors?.status?.message ? 'error' : ''}
                label={
                  <Typography.Text className={classNames(styles['text-title-modal'], 'text-common')}>
                    {t('change_task_status')}
                  </Typography.Text>
                }
              >
                <Controller
                  control={control}
                  name="status"
                  render={({ field: { onChange, value } }) => (
                    <Radio.Group className="font-weight-normal" onChange={onChange} value={value}>
                      <Radio value={taskStatuses.active} className="radio-color-green">
                        {t('active')}
                      </Radio>
                      <Radio value={taskStatuses.inactive} className="radio-color-green">
                        {t('deactived')}
                      </Radio>
                    </Radio.Group>
                  )}
                />
                {errors?.status?.message && <Typography.Text className="color-red">{errors?.status?.message}</Typography.Text>}
              </Form.Item>
              <Form.Item
                className="font-weight-bold text-common mb-px-20"
                label={
                  <Typography.Text className={classNames(styles['text-title-modal'], 'text-common')}>
                    {t('task_disable_reason')}
                  </Typography.Text>
                }
              >
                <Controller
                  control={control}
                  name="reason"
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={convertObjectToOptions(inActivateTaskReasons, {
                        transformKey: key => t(snakeCase(key)),
                      })}
                      disabled={watch('status') === taskStatuses.active}
                      suffixIcon={<DownIcon />}
                      size="large"
                      className="gray-select"
                    />
                  )}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  className="d-block m-auto btn-lg mn-w180p font-weight-bold"
                  size="large"
                  type="primary"
                  disabled={isOrganizationDeleted}
                  loading={isSubmitting}
                  onClick={handleSubmit(onSubmitHandler)}
                >
                  {t('common:button_register_bulk_update')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      {/* Modal update success */}
      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => {
          setUpdateSuccessVisible(false);
          router.push({ pathname: paths.tasks.search });
        }}
        visible={isUpdateSuccessVisible}
        title={t('page_bulk_update_task_title')}
        closable={false}
      >
        <p className="mb-0">
          {t(selectedStatus === taskStatuses.active ? 'active_success_message' : 'inactive_success_message', { count: tasks?.length })}
        </p>
      </ModalInfo>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchBulkUpdateTask: (payload: Payload) => dispatch(bulkUpdateTask(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { tasks = [], isSubmitting, selectedTaskIds = [] } = state.taskReducer;
  return { tasks: tasks?.filter((task: Task) => selectedTaskIds?.includes(task.id)) || [], isSubmitting, selectedTaskIds };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
