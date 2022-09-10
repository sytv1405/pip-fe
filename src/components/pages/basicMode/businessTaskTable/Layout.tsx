import React, { FC, useCallback, useMemo } from 'react';
import { Col, Row, Table, Typography, Grid } from 'antd';
import { useRouter } from 'next/router';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { connect, ConnectedProps } from 'react-redux';
import { Dispatch } from 'redux';

import { paths } from '@/shared/paths';
import { Action, Payload, Task } from '@/types';
import { useTranslation } from 'i18next-config';
import { ExclamationIcon, StarFilledIcon, StarOutlineIcon } from '@/assets/images';
import { getTaskPeriod } from '@/shared/calendar';
import { getCategorySeparatorOfTable, getTableTitleWithSort } from '@/shared/table';
import { markTaskFavorite, updateFavoriteState, updateTaskTransaction } from '@/redux/actions';
import { numberSorter, stringSorter } from '@/utils/sortUtils';
import { extractTaskCode } from '@/utils/TaskUtils';

import styles from './styles.module.scss';

const { useBreakpoint } = Grid;

export type Props = {
  tasks?: Task[];
  backUrl?: string;
  isFavorite?: boolean;
};

const Layout: FC<Props & PropsFromRedux> = ({ tasks, backUrl, dispatchMarkTaskFavorite, dispatchUpdateFavoriteState, isFavorite }) => {
  const [t] = useTranslation('task');
  const router = useRouter();
  const screens = useBreakpoint();

  const getDeadline = useCallback((task: Task) => getTaskPeriod(task, t, null, true) || t('not_setting_due_date'), [t]);

  const handleStar = useCallback(
    (record: Task) => {
      dispatchUpdateFavoriteState({ params: { taskId: record.id } });
      dispatchMarkTaskFavorite({ params: { id: record.id } });
    },
    [dispatchMarkTaskFavorite, dispatchUpdateFavoriteState]
  );

  const columns = useMemo(() => {
    return [
      {
        title: value => getTableTitleWithSort(value, 'taskCode', `${t('task_no')}.`),
        dataIndex: 'taskCode',
        key: 'taskCode',
        sorter: (record1, record2) => {
          const { organizationCode: organizationCode1, taskOrder: taskOrder1 } = extractTaskCode(record1.taskCode);
          const { organizationCode: organizationCode2, taskOrder: taskOrder2 } = extractTaskCode(record2.taskCode);

          return stringSorter(organizationCode1, organizationCode2) || numberSorter(taskOrder1, taskOrder2);
        },
        render: (_, record) => <Typography.Text className="task-no">{record.taskCode}</Typography.Text>,
      },
      {
        dataIndex: 'category',
        title: value => getTableTitleWithSort(value, 'title', t('common:business_unit')),
        render: (_, record) => {
          return (
            <Typography.Text className="category font-weight-medium">
              {[record?.majorCategory?.name, record?.middleCategory?.name, record?.minorCategory?.name]
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
          );
        },
        sorter: (a, b) => (a?.title ?? '').localeCompare(b.title),
      },
      {
        title: value => getTableTitleWithSort(value, 'title', t('task_name')),
        dataIndex: 'title',
        key: 'title',
        sorter: (record1, record2) => stringSorter(record1?.title, record2?.title),
        keepInMobile: true,
        render: (_, record) => (
          <Row justify="space-between" align="middle" className="task--name">
            <Col className={styles['column-expand']}>
              <Typography.Text className="title font-weight-bold">{record?.title}</Typography.Text>
              <br />
              <Typography.Text className="category font-weight-medium">
                {[record?.majorCategory?.name, record?.middleCategory?.name, record?.minorCategory?.name]
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
            <Col className="align-items-end">
              <button
                className={styles['button-star']}
                onClick={e => {
                  e.stopPropagation();
                  handleStar(record);
                }}
              >
                {!isEmpty(record.favoriteTasks) ? <StarFilledIcon /> : <StarOutlineIcon className="favorite--button" />}
              </button>
            </Col>
          </Row>
        ),
      },
      {
        dataIndex: 'deadline',
        title: value => getTableTitleWithSort(value, 'deadline', t('form_deadline')),
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
    ].filter(item => screens.md || item.keepInMobile);
  }, [t, handleStar, getDeadline, screens.md]);

  return (
    <div className={styles['ssc--business-task']}>
      {tasks?.length ? (
        <Table
          columns={columns}
          key="id"
          dataSource={tasks}
          pagination={false}
          showSorterTooltip={false}
          className="ssc-table ssc-table-brown custom-sort-icon cursor-pointer"
          onRow={record => ({
            onClick: () => {
              router.push({ pathname: paths.tasks.detail, query: { taskCode: record?.task?.taskCode ?? record?.taskCode, backUrl } });
            },
          })}
        />
      ) : (
        <div className={styles['nodata-indication']}>{t(isFavorite ? 'no_favorite_data' : 'business_task_nodata')}</div>
      )}
    </div>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchMarkTaskFavorite: (payload: Payload) => dispatch(markTaskFavorite(payload)),
  dispatchUpdateTaskTransaction: (payload: Payload) => dispatch(updateTaskTransaction(payload)),
  dispatchUpdateFavoriteState: (payload: Payload) => dispatch(updateFavoriteState(payload)),
});

const connector = connect(null, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
