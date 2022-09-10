import { useEffect, useCallback, useMemo } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Card, Table, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { connect, ConnectedProps } from 'react-redux';
import { Dispatch } from 'redux';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { Payload, Action, Task } from '@/types';
import { WithAuth } from '@/components/Roots/WithAuth';
import { CircleEmptyIcon, CopyIcon, RightOutLinedIcon, XIcon } from '@/assets/images';
import { paths } from '@/shared/paths';
import { getTasks, setSelectedTasks } from '@/redux/actions';
import { RootState } from '@/redux/rootReducer';
import LoadingScreen from '@/components/LoadingScreen';
import { numberSorter, stringSorter } from '@/utils/sortUtils';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { extractTaskCode } from '@/utils/TaskUtils';
import { getTaskPeriod } from '@/shared/calendar';
import { getCategorySeparatorOfTable, getTableTitleWithSort } from '@/shared/table';

import { normalizeSearchParams } from '../transformValue';

import styles from './styles.module.scss';

const Layout = ({
  dispatchGetTasks,
  dispatchSetSelectedTasks,
  isLoading,
  tasks,
  selectedTaskIds,
  isDisabledBulkUpdate,
  searchState,
}: PropsFromRedux) => {
  const [t] = useTranslation(['task', 'common']);
  const router = useRouter();

  const onSelectTask = useCallback(
    (selectedIds: number[]) => {
      dispatchSetSelectedTasks({ params: { selectedTaskIds: selectedIds } });
    },
    [dispatchSetSelectedTasks]
  );

  useEffect(() => {
    dispatchGetTasks({
      params: {
        ...normalizeSearchParams(searchState),
      },
    });
  }, [dispatchGetTasks, searchState]);

  const columns = useMemo(
    () => [
      {
        title: value => getTableTitleWithSort(value, 'taskCode', `${t('task_no')}.`),
        key: 'taskCode',
        className: 'text-wrap',
        width: '5%',
        sorter: (record1, record2) => {
          const { organizationCode: organizationCode1, taskOrder: taskOrder1 } = extractTaskCode(record1.taskCode);
          const { organizationCode: organizationCode2, taskOrder: taskOrder2 } = extractTaskCode(record2.taskCode);

          return stringSorter(organizationCode1, organizationCode2) || numberSorter(taskOrder1, taskOrder2);
        },
        render: (_, record: any) => (
          <Link href={{ pathname: paths.tasks.detail, query: { taskCode: record.taskCode } }} passHref>
            <a target="_blank" rel="noopener noreferrer" className="text-decoration-none text-common">
              {record.taskCode}
            </a>
          </Link>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'departmentName', t('department')),
        dataIndex: `departmentName`,
        key: `departmentName`,
        width: '15%',
        sorter: (record1, record2) => stringSorter(record1?.department?.name, record2?.department?.name),
        render: (text: string, record: any) => (
          <Typography.Text title={text} className={classNames(styles['text-department'], 'truncate-one-line text-common')}>
            {record?.department?.name}
            {text}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'majorCategoryName', t('common:business_unit')),
        key: `majorCategoryName`,
        dataIndex: 'majorCategoryName',
        width: '20%',
        sorter: (record1, record2) =>
          stringSorter(
            `${record1?.majorCategory?.name} > ${record1?.middleCategory?.name} > ${record1?.minorCategory?.name}`,
            `${record2?.majorCategory?.name} > ${record2?.middleCategory?.name} > ${record2?.minorCategory?.name}`
          ),
        render: (text: string, record: any) => (
          <Typography.Text className={classNames(styles['text-majorCategory'])}>
            <span className="font-weight-medium">{record?.majorCategory?.name}</span>
            {record?.middleCategory?.name && getCategorySeparatorOfTable()}
            {record?.middleCategory?.name}
            {record?.minorCategory?.name && getCategorySeparatorOfTable()}
            {record?.minorCategory?.name}
            {text}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'title', t('task_name')),
        dataIndex: 'title',
        key: 'title',
        width: '40%',
        sorter: (record1, record2) => stringSorter(record1?.title, record2?.title),
        render: (text: string) => (
          <Typography.Text
            title={text}
            className={classNames(styles['text-title-code'], 'truncate-three-line text-common font-weight-bold')}
          >
            {text}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'deadline', t('deadline')),
        dataIndex: 'deadline',
        key: 'deadline',
        sorter: (record1, record2) => stringSorter(getTaskPeriod(record1, t), getTaskPeriod(record2, t)),
        width: '15%',
        render: (_: string, record: Task) => (
          <Typography.Text title={getTaskPeriod(record, t)} className={classNames(styles['text-dealine'], 'text-common truncate-one-line')}>
            {getTaskPeriod(record, t)}
          </Typography.Text>
        ),
      },
      {
        title: value => getTableTitleWithSort(value, 'status', t('active')),
        dataIndex: 'status',
        key: 'status',
        width: '5%',
        sorter: (record1, record2) => numberSorter(record1?.deletedAt ? 1 : 0, record2?.deletedAt ? 1 : 0),
        render: (text: string, record: any) => (
          <div>
            {record?.deletedAt ? <XIcon /> : <CircleEmptyIcon />}
            {text}
          </div>
        ),
      },
    ],
    [t]
  );

  const isOrganizationDeleted = useIsOrganizationDeleted();

  return (
    <WithAuth title={t('page_bulk_update_task_title')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      <Button
        className={styles['back-select-page']}
        type="text"
        icon={<LeftOutlined />}
        onClick={() => router.push({ pathname: paths.tasks.search })}
      >
        {t('button_return_to_select_task')}
      </Button>
      <Typography.Title className={classNames(styles['text-bulk-update-title'], 'd-flex align-items-center')} level={4}>
        <CopyIcon className="mr-2 section-icon" />
        {t('page_bulk_select_task_title')}
      </Typography.Title>
      <Card className="border-none">
        {!isOrganizationDeleted && (
          <Button
            disabled={isDisabledBulkUpdate}
            className={classNames(styles['btn-select-update'], 'mb-3 mt-3 btn-lg', {
              [styles['color-icon-arrowRight']]: !isDisabledBulkUpdate,
            })}
            onClick={() => router.push({ pathname: paths.tasks.bulkUpdate, query: { ...(router?.query || {}) } })}
          >
            {t('button_bulk_update_task')}
            <RightOutLinedIcon />
          </Button>
        )}
        <Table
          className="table-header-center nowrap ssc-table ssc-table-brown custom-sort-icon select-task-table ssc-table-tasks"
          rowSelection={{
            type: 'checkbox',
            onChange: onSelectTask,
            selectedRowKeys: selectedTaskIds,
          }}
          columns={columns}
          rowKey="id"
          dataSource={tasks}
          pagination={false}
        />
        {!isOrganizationDeleted && (
          <Button
            disabled={isDisabledBulkUpdate}
            className={classNames(styles['btn-select-update'], 'mb-3 mt-3 btn-lg', {
              [styles['color-icon-arrowRight']]: !isDisabledBulkUpdate,
            })}
            icon={<RightOutlined />}
            onClick={() => router.push({ pathname: paths.tasks.bulkUpdate, query: { ...(router?.query || {}) } })}
          >
            {t('button_bulk_update_task')}
          </Button>
        )}
      </Card>
    </WithAuth>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetTasks: (payload: Payload) => dispatch(getTasks(payload)),
  dispatchSetSelectedTasks: (payload: Payload) => dispatch(setSelectedTasks(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { tasks, isLoading, selectedTaskIds, searchState } = state.taskReducer;
  const { user } = state.authReducer;
  return {
    tasks,
    isLoading,
    selectedTaskIds,
    isDisabledBulkUpdate: !selectedTaskIds?.length || !!user?.organization?.isDelete,
    searchState,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
