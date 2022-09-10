import { useEffect, useMemo, useState, useCallback } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Col, Collapse, Row, Space, Table, Typography } from 'antd';
import { snakeCase } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { connect, ConnectedProps } from 'react-redux';
import classNames from 'classnames';

import LoadingScreen from '@/components/LoadingScreen';
import { ModalInfo } from '@/components/modal';
import { WithAuth } from '@/components/Roots/WithAuth';
import { getTaskDetail } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import { paths } from '@/shared/paths';
import { Payload } from '@/types';
import { convertToDateJP } from '@/utils/dateJp';
import { useTranslation } from 'i18next-config';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { numberSorter } from '@/utils/sortUtils';
import { getTaskPeriod } from '@/shared/calendar';
import FileDynamicIcon from '@/components/FileDynamicIcon';
import {
  CalendarGreenIcon,
  ClockGreenIcon,
  CollapseDownIcon,
  CollapseUpIcon,
  HyphenIcon,
  ListGreenIcon,
  MessageGreenIcon,
  PersonalGreenIcon,
} from '@/assets/images';
import { formatDateTime } from '@/utils/dateTimeUtils';
import { DATE_TIME_FORMAT_FILE_UPLOAD } from '@/shared/constants';

import { inActivateTaskReasons } from '../constants';

import ModalActivateTask from './modal/ModalActivateTask';
import { ModalProps, TaskModalTypes } from './types';
import styles from './styles.module.scss';
import Comments from './Comments';
import Transactions from './Transactions';
import ModalCreateTransaction from './modal/ModalCreateTransaction';

const TaskDetail = ({ isLoading, dispatchGetTaskDetail, taskDetail }: PropsFromRedux) => {
  const [t] = useTranslation('task');
  const [isModalTaskNotFoundVisible, setIsModalTaskNotFoundVisible] = useState(false);
  const isOrganizationDeleted = useIsOrganizationDeleted();

  const isDisabledAction = useMemo(() => isOrganizationDeleted || !!taskDetail?.deletedAt, [taskDetail, isOrganizationDeleted]);
  const hasBusinessUnits = useMemo(
    () => [taskDetail?.majorCategory, taskDetail?.middleCategory, taskDetail?.minorCategory].some(Boolean),
    [taskDetail]
  );

  const router = useRouter();
  const { taskCode, backUrl } = router.query;

  const [modal, setModal] = useState<ModalProps>(null);

  const columns = useMemo(
    () => [
      {
        title: 'No.',
        key: 'orderNo',
        width: '10%',
        className: 'text-wrap text-center',
        dataIndex: 'orderNo',
      },
      {
        title: t('process'),
        key: 'content',
        width: '45%',
        className: 'text-left text-wrap',
        dataIndex: 'content',
      },
      {
        title: t('process_description'),
        key: 'outcome',
        width: '45%',
        className: 'text-left text-wrap text-pre-line',
        dataIndex: 'outcome',
      },
    ],
    [t]
  );

  useEffect(() => {
    dispatchGetTaskDetail({
      params: { taskCode },
      errorCallback: () => setIsModalTaskNotFoundVisible(true),
    });
  }, [dispatchGetTaskDetail, taskCode]);

  const inActiveReason = useMemo(() => {
    const reason = Object.keys(inActivateTaskReasons)[Object.values(inActivateTaskReasons).indexOf(taskDetail?.reason)];
    return reason && snakeCase(reason);
  }, [taskDetail?.reason]);

  const handleScrollToComment = useCallback(() => {
    const commentsEl = document.getElementById('comments');

    commentsEl?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const task = taskDetail;

  const deadline = useMemo(() => getTaskPeriod(task, t, null, true), [task, t]);

  const handleOpenCreateTransaction = useCallback(() => {
    setModal({
      type: TaskModalTypes.CreateTransaction,
      onCancel: () => setModal(null),
      task: taskDetail,
    });
  }, [setModal, taskDetail]);

  return (
    <WithAuth isContentFullWidth title={t('task_detail')}>
      {isLoading && <LoadingScreen />}

      <div className={classNames(styles['header-container'], 'd-flex justify-content-between')}>
        {backUrl && (
          <Button type="link" icon={<LeftOutlined />} onClick={() => router.push((backUrl || paths.tasks.search) as any)}>
            {t('button_return_to_select_task')}
          </Button>
        )}
        <div className={classNames(styles['prev-next__task'], 'flex-column')}>
          {!!taskDetail?.previousTask && (
            <Link href={{ pathname: paths.tasks.detail, query: { taskCode: taskDetail?.previousTask?.taskCode } }}>
              <a className="px-0 link-underline mr-3">
                {t('previous_task')}：{taskDetail?.previousTask?.title}
              </a>
            </Link>
          )}
          {!!taskDetail?.nextTask && (
            <Link href={{ pathname: paths.tasks.detail, query: { taskCode: taskDetail?.nextTask?.taskCode } }}>
              <a className="px-0 link-underline">
                {t('next_task')}：{taskDetail?.nextTask?.title}
              </a>
            </Link>
          )}
        </div>
      </div>

      {/* Task Card  */}
      {taskDetail?.deletedAt && (
        <div className={styles['inactive-task']}>
          <Typography.Paragraph className={styles.title}>{t('task_disable_message')}</Typography.Paragraph>
          <Typography.Paragraph className={styles['sub-title']}>{`${t('task_disable_reason')}:${t(inActiveReason)}`}</Typography.Paragraph>
          <Button
            onClick={
              isOrganizationDeleted
                ? undefined
                : () =>
                    setModal({
                      type: TaskModalTypes.ActivateTask,
                      onCancel: () => setModal(null),
                      task: taskDetail,
                    })
            }
            className="font-weight-bold"
            type="primary"
          >
            {t('button_activate_task')}
          </Button>
        </div>
      )}
      <Card bordered={false} className={styles['task-container']}>
        <div className={styles['task-code']}>
          <span>
            {t('task_no')}. {taskDetail?.taskCode}
          </span>
        </div>

        <Row justify="end">
          <Col hidden={isDisabledAction}>
            <div className={classNames(styles['btn-list_edit_start'], 'd-flex align-items-center')}>
              <MessageGreenIcon
                className={classNames(styles['button-to-comment'], 'mr-2 cursor-pointer')}
                onClick={handleScrollToComment}
              />
              <Button
                className="mr-2 mn-w125p font-weight-medium"
                size="large"
                onClick={() => router.push({ pathname: paths.tasks.edit, query: { taskCode } })}
              >
                {t('button_update_task')}
              </Button>
              <Button className="mr-2 mn-w125p font-weight-bold" size="large" type="primary" onClick={handleOpenCreateTransaction}>
                {t('button_start_task')}
              </Button>
            </div>
          </Col>
        </Row>

        <div className={styles.breadcrumb}>
          {hasBusinessUnits && (
            <Space size="small" className="mr-5">
              <div className={classNames(styles['breabcrum-list'], 'px-0')}>
                <span className={classNames(styles['text-breadcrum'], 'font-weight-medium')}>{taskDetail?.majorCategory?.name}</span>
                {taskDetail?.middleCategory?.name && <RightOutlined className="ml-3 mr-3" />}
                <span className={classNames(styles['text-breadcrum'], 'font-weight-medium')}>{taskDetail?.middleCategory?.name}</span>
                {taskDetail?.minorCategory?.name && <RightOutlined className="ml-3 mr-3" />}
                <span className={classNames(styles['text-breadcrum'], 'font-weight-medium')}>{taskDetail?.minorCategory?.name}</span>
              </div>
            </Space>
          )}
        </div>

        <Typography.Title className={styles['task-detail__title']} level={4}>
          {taskDetail?.title}
        </Typography.Title>

        <Row justify="space-between" className={styles['list-schedule']}>
          <Col className={classNames(styles['list-schedule__horizontal'], 'd-flex')}>
            <div className="mr-4 d-flex align-items-center">
              <CalendarGreenIcon className="mr-2" />
              {taskDetail?.basisType ? (
                <Typography.Paragraph className="mb-0">{t(`task_type_${taskDetail?.basisType.toLowerCase()}`)}</Typography.Paragraph>
              ) : (
                <HyphenIcon />
              )}
            </div>
            <div className="mr-4 d-flex align-items-center">
              <PersonalGreenIcon className="mr-2" />
              {taskDetail?.department?.name ? (
                <Typography.Paragraph className="mb-0">{taskDetail?.department?.name}</Typography.Paragraph>
              ) : (
                <HyphenIcon />
              )}
            </div>
            <div className="mr-4 d-flex align-items-center">
              <ListGreenIcon className="mr-2" />
              {deadline ? <Typography.Paragraph className="mb-0">{deadline}</Typography.Paragraph> : <HyphenIcon />}
            </div>
            <div className="mr-4 d-flex align-items-center">
              <ClockGreenIcon className="mr-2" />
              {taskDetail?.leadTimeDay !== null ? (
                <Typography.Paragraph className="mb-0">
                  {taskDetail?.leadTimeDay}
                  {taskDetail?.leadTimeType && t(`lead_time_${taskDetail?.leadTimeType.toLowerCase()}`)}
                </Typography.Paragraph>
              ) : (
                <HyphenIcon />
              )}
            </div>
          </Col>
          <Col>
            <Typography.Paragraph className={styles['list-schedule__datetime']}>
              {t('created_by')}：{taskDetail?.createdByUser?.name} &nbsp;{convertToDateJP(taskDetail?.createdAt, 'dateTime')}
              <br />
              {t('updated_by')}：{taskDetail?.modifiedByUser?.name} &nbsp;{convertToDateJP(taskDetail?.modifiedAt, 'dateTime')}
            </Typography.Paragraph>
          </Col>
        </Row>

        <div className={styles['modal-overview']}>
          <div className="d-flex align-items-center">
            <Typography.Title className={styles['title-modal-overview']} level={4}>
              {t('purpose')}
            </Typography.Title>
            {taskDetail?.purpose ? (
              <Typography.Paragraph className={styles['content-modal-overview']}>{taskDetail?.purpose}</Typography.Paragraph>
            ) : (
              <HyphenIcon className={styles['icon-no-data-modal-overview']} />
            )}
          </div>
          <hr />
          <div className="d-flex align-items-center">
            <Typography.Title className={styles['title-modal-overview']} level={4}>
              {t('overview')}
            </Typography.Title>
            {taskDetail?.overview ? (
              <Typography.Paragraph className={styles['content-modal-overview']}>{taskDetail?.overview}</Typography.Paragraph>
            ) : (
              <HyphenIcon className={styles['icon-no-data-modal-overview']} />
            )}
          </div>
        </div>

        <div className={styles['task-modal']}>
          <Typography.Title level={4}>{t('work_content')}</Typography.Title>
          {taskDetail?.taskProcesses?.length ? (
            <div className={styles['task-table']}>
              <Table
                className={classNames(styles['table-task-detail'], 'table-header-center', 'nowrap', 'ssc-table ssc-table-brown')}
                columns={columns}
                dataSource={taskDetail?.taskProcesses?.sort((record1, record2) => numberSorter(record1.orderNo, record2.orderNo))}
                pagination={false}
              />
            </div>
          ) : (
            <HyphenIcon />
          )}
          {taskDetail.explanation && <Typography.Paragraph className="mb-5 text-pre-line">{taskDetail.explanation}</Typography.Paragraph>}

          <div className={classNames(styles['task-modal__table'], 'd-flex')}>
            <div className={classNames('d-flex', { 'align-items-center': !taskDetail?.taskAttachments?.length })}>
              <div className={classNames(styles['item-work-button'], 'd-flex')}>{t('attachment')}</div>
              {taskDetail?.taskAttachments?.length ? (
                <div className={classNames(styles['item-work-attachment'], 'd-flex')}>
                  {taskDetail?.taskAttachments?.map(item => (
                    <div className="d-flex align-items-center">
                      <FileDynamicIcon fileName={item?.name} />
                      <a className="ml-2 text-underline" href={item?.url} target="_blank" rel="noreferrer">
                        {item?.name}
                        <span>({formatDateTime(item.createdAt, DATE_TIME_FORMAT_FILE_UPLOAD)})</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <HyphenIcon />
              )}
            </div>

            <div className={classNames('d-flex', { 'align-items-center': !taskDetail?.taskRegulations?.length })}>
              <div className={classNames(styles['item-work-button'], 'd-flex')}>{t('regulation')}</div>
              {taskDetail?.taskRegulations?.length ? (
                <div className="d-flex flex-column my-1">
                  {taskDetail?.taskRegulations?.map(item => (
                    <div>
                      {item?.regulation?.regulationType?.name}&nbsp;
                      {item?.regulation?.name}&nbsp;
                      {item?.memo}
                    </div>
                  ))}
                </div>
              ) : (
                <HyphenIcon />
              )}
            </div>

            <div className={classNames('d-flex', { 'align-items-center': !taskDetail?.taskNotifications?.length })}>
              <div className={classNames(styles['item-work-button'], 'd-flex')}>{t('notification')}</div>
              {taskDetail?.taskNotifications?.length ? (
                <div className={classNames(styles['item-work-attachment'], 'd-flex')}>
                  {taskDetail?.taskNotifications?.map(item => (
                    <>
                      <Typography.Paragraph className={classNames(styles['task-notice__title'], 'mb-0')}>{item.name}</Typography.Paragraph>
                      {!!item?.fileName && (
                        <div className="d-flex align-items-center">
                          <FileDynamicIcon fileName={item?.fileName} />
                          <a className="ml-2 text-underline text-secondary" href={item?.url} target="_blank" rel="noreferrer">
                            {item?.fileName} <br />
                          </a>
                        </div>
                      )}
                    </>
                  ))}
                </div>
              ) : (
                <HyphenIcon />
              )}
            </div>
          </div>

          <Collapse
            ghost
            className={classNames(styles['task-collapse'], 'ant-collapse--custom')}
            expandIconPosition="right"
            expandIcon={({ isActive }) => (isActive ? <CollapseUpIcon /> : <CollapseDownIcon />)}
          >
            <Collapse.Panel key={1} header={<span className={styles['task-collapse_changelog']}>{t('change_log')}</span>}>
              <Typography.Paragraph className="text-pre-line mb-0">
                <div>
                  {taskDetail?.taskHistories?.map((item, index) => (
                    <div className="d-flex change-log__content">
                      <p className="font-weight-bold m-0">
                        <span className="mr-3">{item?.user?.name}</span>
                        <span>{convertToDateJP(item?.createdAt, 'dateTime')}</span>
                      </p>
                      <p>{index === 0 ? t('task_created') : t('task_updated')} </p>
                    </div>
                  ))}
                </div>
              </Typography.Paragraph>
            </Collapse.Panel>
          </Collapse>
        </div>
      </Card>

      {/* Transaction Card */}
      <Transactions t={t} isDisabledAction={isDisabledAction} openCreateTransaction={handleOpenCreateTransaction} />

      {/* Comment box  */}
      <Comments />

      {modal?.type === TaskModalTypes.CreateTransaction && <ModalCreateTransaction visible {...modal} />}
      {modal?.type === TaskModalTypes.ActivateTask && <ModalActivateTask visible {...modal} />}
      <ModalInfo
        okText={t('button_return_to_search_task')}
        onOk={() => {
          setIsModalTaskNotFoundVisible(false);
          router.push((router?.query?.back || paths.tasks.search) as any);
        }}
        maskClosable={false}
        closable={false}
        visible={isModalTaskNotFoundVisible}
        title={t('common:page_task_search')}
      >
        <p className="mb-0">{t('task_not_found')}</p>
      </ModalInfo>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: any) => ({
  dispatchGetTaskDetail: (payload: Payload) => dispatch(getTaskDetail(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { taskDetail = {} as any, isLoading } = state.taskReducer;
  return { taskDetail, isLoading };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(TaskDetail);
