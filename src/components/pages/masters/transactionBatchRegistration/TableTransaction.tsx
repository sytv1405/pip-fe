import { Collapse } from 'antd';
import classNames from 'classnames';
import { Dispatch, useEffect, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { first, groupBy } from 'lodash';

import { CollapseDownIcon, CollapseUpIcon } from '@/assets/images';
import { RootState } from '@/redux/rootReducer';
import { getTaskForBulkTransaction } from '@/redux/actions';
import { getCategorySeparatorOfTable } from '@/shared/table';
import { Action, Payload } from '@/types';
import { LEVEL_BUSINESS_UNIT, TYPE_CATEGORY } from '@/shared/constants';

import styles from './styles.module.scss';
import GroupTask from './GroupTask';

interface TableTransactionProps extends PropsFromRedux {
  deparmentId: number;
  levelBusinessId: string;
}

const TableTransaction = (props: TableTransactionProps) => {
  const { levelBusinessId, deparmentId, tasks, dispatchGetTaskForBulkTransaction } = props || {};

  const taskDependCategory = useMemo(() => {
    switch (levelBusinessId) {
      case LEVEL_BUSINESS_UNIT.large:
        return groupBy(
          tasks.filter(task => task.majorCategory),
          `${TYPE_CATEGORY.majorCategory}.id`
        );
      case LEVEL_BUSINESS_UNIT.medium:
        return groupBy(
          tasks.filter(task => task.middleCategory),
          `${TYPE_CATEGORY.middleCategory}.id`
        );
      case LEVEL_BUSINESS_UNIT.small:
        return groupBy(
          tasks.filter(task => task.minorCategory),
          `${TYPE_CATEGORY.minorCategory}.id`
        );
      default:
        return {};
    }
  }, [levelBusinessId, tasks]);

  useEffect(() => {
    dispatchGetTaskForBulkTransaction({
      params: {
        businessUnitLevel: levelBusinessId || '',
        departmentId: deparmentId || null,
      },
    });
  }, [deparmentId, dispatchGetTaskForBulkTransaction, levelBusinessId]);

  return (
    <>
      {!deparmentId && <GroupTask tasksByCategory={tasks} />}
      {deparmentId && levelBusinessId === LEVEL_BUSINESS_UNIT.all && (
        <GroupTask levelBusinessId={levelBusinessId} deparmentId={deparmentId} tasksByCategory={tasks} />
      )}
      {deparmentId && levelBusinessId !== LEVEL_BUSINESS_UNIT.all && (
        <>
          {Object.entries(taskDependCategory).map(([_, tasksByCategory], index) => {
            const firstTask = first(tasksByCategory);
            return (
              <Collapse
                key={index}
                ghost
                expandIcon={({ isActive }) => (isActive ? <CollapseUpIcon /> : <CollapseDownIcon />)}
                className={classNames(styles['collapse-container'], 'ant-collapse--custom')}
              >
                <Collapse.Panel
                  key={index}
                  header={
                    <div className="flex-column">
                      <span className={classNames(styles['title-sub-collapse'], 'd-flex align-items-center')}>
                        {levelBusinessId === LEVEL_BUSINESS_UNIT.medium && <span>{firstTask?.majorCategory?.name}</span>}
                        {levelBusinessId === LEVEL_BUSINESS_UNIT.small && (
                          <>
                            <span>{firstTask?.majorCategory?.name}</span>
                            {getCategorySeparatorOfTable()}
                            <span>{firstTask?.middleCategory?.name}</span>
                          </>
                        )}
                      </span>
                      <span className={styles['title-main-collapse']}>
                        {levelBusinessId === LEVEL_BUSINESS_UNIT.large && <span>{firstTask?.majorCategory?.name}</span>}
                        {levelBusinessId === LEVEL_BUSINESS_UNIT.medium && <span>{firstTask?.middleCategory?.name}</span>}
                        {levelBusinessId === LEVEL_BUSINESS_UNIT.small && <span>{firstTask?.minorCategory?.name}</span>}
                      </span>
                    </div>
                  }
                >
                  <div className={styles['collapse-body']}>
                    <div className={styles['border-collapse']}></div>
                    <GroupTask levelBusinessId={levelBusinessId} deparmentId={deparmentId} tasksByCategory={tasksByCategory} />
                  </div>
                </Collapse.Panel>
              </Collapse>
            );
          })}
        </>
      )}
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchGetTaskForBulkTransaction: (payload: Payload) => dispatch(getTaskForBulkTransaction(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { taskForBulkTransaction: tasks } = state.taskReducer;
  return { tasks };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(TableTransaction);
