import React, { useEffect, useState, Fragment, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Spin } from 'antd';
import classNames from 'classnames';
import { last } from 'lodash';

import { useTranslation } from 'i18next-config';
import { paths } from '@/shared/paths';
import { LARGE_BUSINESS, MEDIUM_BUSINESS, SMALL_BUSINESS } from '@/shared/constants';
import { BoxDownIcon, BoxUpIcon, EllipseIcon } from '@/assets/images';

import styles from './styles.module.scss';

interface DataColumns {
  title: string;
  dataIndex: string;
  key?: string;
  showExpand?: boolean;
  styles?: any;
  render?: (text: string, row: any, key: string) => any;
}

interface TableProps {
  dataSource: any[];
  onExpand?: any;
  expandedRowKeys?: string[];
  loading?: boolean;
}

const BusinessSearchTable = (props: TableProps) => {
  const [t] = useTranslation('business_unit');
  const [_expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [_dataSource, setDataSource] = useState([]);
  const mediumLastChild = useRef('');
  const minorLastChild = useRef('');

  const { dataSource, onExpand, expandedRowKeys, loading } = props;
  const columns = useMemo(
    () => [
      {
        title: `${t('common:business_unit')}（${t('common:large')}）`,
        dataIndex: 'major',
        key: 'major',
        styles: {
          width: '16%',
          textAlign: 'center',
        },
        showExpand: true,
      },
      {
        title: `${t('common:business_unit')}（${t('common:medium')}）`,
        dataIndex: 'medium',
        key: 'medium',
        styles: {
          width: '22%',
          textAlign: 'center',
        },
        showExpand: true,
      },
      {
        title: `${t('common:business_unit')}（${t('common:small')}）`,
        dataIndex: 'minor',
        key: 'minor',
        styles: {
          width: '22%',
          textAlign: 'center',
        },
        showExpand: true,
      },
      {
        title: `${t('task_description')}`,
        dataIndex: 'tasks',
        key: 'tasks',
        styles: {
          width: '40%',
          textAlign: 'center',
        },
        render: text => {
          return text
            ? text.map((item, index) => {
                return (
                  <div className={classNames(styles.task__title)} key={index}>
                    <div className={classNames(styles['task-business-unit'], 'd-flex')}>
                      <EllipseIcon className="mr-1" />
                      <Link href={{ pathname: paths.tasks.detail, query: { taskCode: item.taskCode } }} passHref>
                        <a target="_blank" rel="noopener noreferrer" className="text-underline text-secondary">
                          {item.title}
                        </a>
                      </Link>
                    </div>
                  </div>
                );
              })
            : '';
        },
      },
    ],
    [t]
  );

  const handleExpand = useCallback(
    row => {
      const expanded = _expandedRowKeys.indexOf(row.key) > -1;
      const newRowKeys: string[] = [..._expandedRowKeys];
      if (expanded) {
        setExpandedRowKeys(newRowKeys.filter(item => item !== row.key));
      } else {
        newRowKeys.push(row.key);
        setExpandedRowKeys(newRowKeys);
      }

      if (onExpand) {
        onExpand(!expanded, row, newRowKeys);
      }
    },
    [_expandedRowKeys, onExpand]
  );

  const checkLineBottom = useCallback(
    (row, index = 0): boolean => {
      switch (row.type) {
        case LARGE_BUSINESS:
          mediumLastChild.current = (last(row?.children) as any)?.key;
          return _expandedRowKeys.includes(row.key) && row.children.length > 0;
        case MEDIUM_BUSINESS:
          minorLastChild.current = (last(row?.children) as any)?.key;
          if (_expandedRowKeys.includes(row.key) && index > 0) {
            if (row.children.length > 0) return true;
            if (!row.key.includes(mediumLastChild.current)) return true;
          }
          return false;
        case SMALL_BUSINESS:
          if (_expandedRowKeys.includes(row.key) && index > 1) {
            if (!row.key.startsWith(mediumLastChild.current)) return true;
            if (!row.key.includes(minorLastChild.current)) return true;
          }
          return false;
        default:
          return false;
      }
    },
    [_expandedRowKeys]
  );

  const cellRender = useCallback(
    (column, row, index) => {
      const { dataIndex } = column;
      const text = column.dataIndex ? row[column.dataIndex] : '';
      const expanded = _expandedRowKeys.indexOf(row.key) > -1;
      return dataIndex === 'tasks' ? (
        <td className={styles['cell-task-search']} key={index}>
          {expanded && (column.render ? column.render(text, row, row.key) : text)}
          <div className={styles['line-bottom']}>{checkLineBottom(row, index) && <div className={styles['divide-line']}></div>}</div>
        </td>
      ) : (
        <td className={styles['cell-task-search']} key={index}>
          <div className={styles['gap-cell-left']}>
            {column.showExpand && text ? (
              <span
                onClick={() => {
                  handleExpand(row);
                }}
                className={classNames(styles['btn-show-child'], 'px-0 mr-2')}
              >
                {expanded ? <BoxUpIcon /> : <BoxDownIcon />}
              </span>
            ) : (
              ''
            )}
            {column.render ? column.render(text, row, row.key) : text}
          </div>
          <div className={styles['line-bottom']}>{checkLineBottom(row, index) && <div className={styles['divide-line']}></div>}</div>
        </td>
      );
    },
    [_expandedRowKeys, checkLineBottom, handleExpand]
  );

  const rowRender = useCallback(
    (row, index, orderOfLargeBusiness) => {
      return (
        <Fragment key={index}>
          <tr className={classNames({ [styles['gray-row']]: orderOfLargeBusiness % 2 === 0 })}>
            {columns.map((item: DataColumns, i) => cellRender(item, row, i))}
          </tr>
          {row.children && _expandedRowKeys.indexOf(row.key) > -1
            ? row.children.map((child, i) => {
                return rowRender(child, `${child.key}-${i}`, orderOfLargeBusiness);
              })
            : undefined}
        </Fragment>
      );
    },
    [_expandedRowKeys, cellRender, columns]
  );

  const renderBody = useCallback(() => {
    let countLargeBusinessGroup = 0;
    return _dataSource.map((row, index) => {
      if (row.type === LARGE_BUSINESS) {
        countLargeBusinessGroup += 1;
      }
      return rowRender(row, index, countLargeBusinessGroup);
    });
  }, [_dataSource, rowRender]);

  const columnsRender = dataColumns => {
    return dataColumns.map((item: DataColumns, index) => {
      return (
        <td key={index} style={item.styles}>
          <div className={styles.result__title}>{item.title}</div>
        </td>
      );
    });
  };

  useEffect(() => {
    if (dataSource) {
      setDataSource(dataSource);
    }
  }, [dataSource]);

  useEffect(() => {
    if (expandedRowKeys) {
      setExpandedRowKeys(expandedRowKeys);
    }
  }, [expandedRowKeys]);

  return (
    <Spin spinning={loading}>
      <div className={styles['business-unit-container']}>
        <table className={styles['businees-unit-search']}>
          <thead className={styles['business-table-thead']}>
            <tr>{columnsRender(columns)}</tr>
          </thead>
          <tbody className={styles['business-table-tbody']}>{renderBody()}</tbody>
        </table>
      </div>
    </Spin>
  );
};

export default BusinessSearchTable;
