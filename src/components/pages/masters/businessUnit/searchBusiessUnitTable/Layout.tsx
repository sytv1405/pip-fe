import { Table } from 'antd';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { connect, ConnectedProps } from 'react-redux';
import Link from 'next/link';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';
import { arrayMoveImmutable } from 'array-move';
import classNames from 'classnames';

import { BusinessUnitLevel } from '@/shared/enum';
import { RootState } from '@/redux/rootReducer';
import { searchBusinessUnit, sortBusinessUnit } from '@/redux/actions/businessUnitActions';
import { paths } from '@/shared/paths';
import { Payload } from '@/types';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { DragIcon, EditIcon } from '@/assets/images';

import styles from '../styles.module.scss';

const DragHandle = SortableHandle(() => <DragIcon className={styles['button-drag']} />);
const SortableItem = SortableElement(props => <tr {...props} className={classNames(props.className, styles['search-table-row'])} />);
const SortableBody = SortableContainer(props => <tbody {...props} />);

const Layout: FC<PropsFromRedux> = ({
  businessUnitSearch,
  isSortLoading,
  businessUnitQueryParam: { businessLevel, keyword, departmentId, hasNoChildren },
  dispatchSortSearchedBusinessUnit,
  dispatchSearchBusinessUnit,
}) => {
  const isOrganizationDeleted = useIsOrganizationDeleted();
  const [t] = useTranslation(['business_unit', 'department_master']);
  const largeBusinessColumnName = t('business_unit_large');
  const mediumBusinessColumnName = t('business_unit_medium');
  const smallBusinessColumnName = t('business_unit_small');

  const [dataSource, setDataSource] = useState(businessUnitSearch);

  const getColumns = useCallback(() => {
    const dragAndDropColumn = {
      title: t('department_master:sort_by'),
      dataIndex: 'sort',
      width: 80,
      className: 'drag-visible',
      render: () => (
        <div className="d-flex justify-content-center">
          <DragHandle />
        </div>
      ),
    };

    const columnBuilt: ColumnsType = [...(!keyword && !hasNoChildren ? [dragAndDropColumn] : [])];

    switch (businessLevel) {
      case BusinessUnitLevel.large:
        columnBuilt.push({
          title: <div className="d-flex justify-content-start">{largeBusinessColumnName}</div>,
          dataIndex: 'name',
          className: 'drag-visible text-center font-weight-bold',
          render: (_: string, item: SearchedBusinessUnit) => (
            <div className="text-left font-weight-normal">
              {isOrganizationDeleted ? (
                item.name
              ) : (
                <Link href={{ pathname: paths.master.businessUnit.largeEdit, query: { id: item.id } }}>
                  <a className="link-underline text-normal font-weight-bold">
                    <span>{item.name}</span>
                    <EditIcon className={styles['edit-icon']} />
                  </a>
                </Link>
              )}
            </div>
          ),
        });
        break;
      case BusinessUnitLevel.medium:
        columnBuilt.push(
          {
            title: <div className="d-flex justify-content-start">{largeBusinessColumnName}</div>,
            dataIndex: 'name',
            className: 'drag-visible text-center font-weight-bold',
            render: (_: string, item: SearchedBusinessUnit) => (
              <div className="text-left font-weight-normal">
                {isOrganizationDeleted ? item.name : <span className="text-normal font-weight-bold">{item.majorCategory?.name}</span>}
              </div>
            ),
          },
          {
            title: <div className="d-flex justify-content-start">{mediumBusinessColumnName}</div>,
            dataIndex: 'name',
            className: 'drag-visible text-center font-weight-bold',
            render: (_: string, item: SearchedBusinessUnit) => (
              <div className="text-left font-weight-normal">
                {isOrganizationDeleted ? (
                  item.name
                ) : (
                  <Link href={{ pathname: paths.master.businessUnit.mediumEdit, query: { id: item.id } }}>
                    <a className="link-underline text-normal font-weight-bold">
                      <span>{item.name}</span>
                      <EditIcon className={styles['edit-icon']} />
                    </a>
                  </Link>
                )}
              </div>
            ),
          }
        );
        break;
      default:
        columnBuilt.push(
          {
            title: <div className="d-flex justify-content-start">{largeBusinessColumnName}</div>,
            dataIndex: 'name',
            className: 'drag-visible text-center font-weight-bold',
            render: (_: string, item: SearchedBusinessUnit) => (
              <div className="text-left font-weight-normal">
                {isOrganizationDeleted ? item.name : <span className="text-normal font-weight-bold">{item.majorCategory?.name}</span>}
              </div>
            ),
          },
          {
            title: <div className="d-flex justify-content-start">{mediumBusinessColumnName}</div>,
            dataIndex: 'name',
            className: 'drag-visible text-center font-weight-bold',
            render: (_: string, item: SearchedBusinessUnit) => (
              <div className="text-left font-weight-normal">
                {isOrganizationDeleted ? item.name : <span className="text-normal font-weight-bold">{item.middleCategory?.name}</span>}
              </div>
            ),
          },
          {
            title: <div className="d-flex justify-content-start">{smallBusinessColumnName}</div>,
            dataIndex: 'name',
            className: 'drag-visible text-center font-weight-bold',
            render: (_: string, item: SearchedBusinessUnit) => (
              <div className="text-left font-weight-normal">
                {isOrganizationDeleted ? (
                  item.name
                ) : (
                  <Link href={{ pathname: paths.master.businessUnit.smallEdit, query: { id: item.id } }}>
                    <a className="link-underline text-normal font-weight-bold text-wrap">
                      <span>{item.name}</span>
                      <EditIcon className={styles['edit-icon']} />
                    </a>
                  </Link>
                )}
              </div>
            ),
          }
        );
        break;
    }

    return columnBuilt;
  }, [
    t,
    businessLevel,
    hasNoChildren,
    keyword,
    largeBusinessColumnName,
    mediumBusinessColumnName,
    smallBusinessColumnName,
    isOrganizationDeleted,
  ]);

  const canSortCategory = (oldIndex: number, newIndex: number): boolean => {
    if (businessLevel === BusinessUnitLevel.large && dataSource[oldIndex].department.id === dataSource[newIndex].department.id) {
      return true;
    }

    if (businessLevel === BusinessUnitLevel.medium && dataSource[oldIndex].majorCategory.id === dataSource[newIndex].majorCategory.id) {
      return true;
    }

    if (
      businessLevel === BusinessUnitLevel.small &&
      dataSource[oldIndex].majorCategory.id === dataSource[newIndex].majorCategory.id &&
      dataSource[oldIndex].middleCategory.id === dataSource[newIndex].middleCategory.id
    ) {
      return true;
    }

    return false;
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      if (!canSortCategory(oldIndex, newIndex)) {
        return;
      }

      const newData = arrayMoveImmutable([].concat(dataSource), oldIndex, newIndex).filter(el => !!el);

      setDataSource(newData);

      dispatchSortSearchedBusinessUnit({
        params: {
          businessLevel,
          categories: newData.map((item, index) => ({
            id: item.id,
            orderNo: dataSource[index].orderNo,
          })),
        },
        callback: () => {
          dispatchSearchBusinessUnit({ params: { businessLevel, keyword, departmentId, hasNoChildren } });
        },
      });
    }
  };

  const draggableContainer = props => (
    <SortableBody useDragHandle disableAutoscroll helperClass="row-dragging" onSortEnd={onSortEnd} {...props} />
  );

  const draggableBodyRow = ({ ...restProps }) => {
    const index = dataSource.findIndex(x => x.id === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} disabled={isOrganizationDeleted} />;
  };

  useEffect(() => {
    setDataSource(businessUnitSearch);
  }, [businessUnitSearch]);

  return (
    <Table
      pagination={false}
      dataSource={dataSource}
      columns={getColumns()}
      rowKey="id"
      components={{
        body: {
          wrapper: draggableContainer,
          row: draggableBodyRow,
        },
      }}
      loading={isSortLoading}
      className={classNames(styles['business-unit-table'], 'ssc-table ssc-table-white custom-sort-icon')}
    />
  );
};

const mapStateToProps = (state: RootState) => {
  const { businessUnitSearch, isSortLoading, businessLevel, businessUnitQueryParam } = state.businessUnitReducer;
  return { businessUnitSearch, isSortLoading, businessLevel, businessUnitQueryParam };
};

const mapDispatchToProps = dispatch => ({
  dispatchSortSearchedBusinessUnit: payload => dispatch(sortBusinessUnit(payload)),
  dispatchSearchBusinessUnit: (payload: Payload) => dispatch(searchBusinessUnit(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
