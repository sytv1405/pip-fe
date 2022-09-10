import { ColumnTitleProps } from 'antd/lib/table/interface';
import classNames from 'classnames';

import { ArrowRightIcon, LineCaretDownIcon, LineCaretUpIcon } from '@/assets/images';

export const getTableTitleWithSort = ({ sortColumns }: ColumnTitleProps<unknown>, columnName: string, title: string) => {
  const sortedColumn = sortColumns?.find(({ column }) => column.dataIndex === columnName);

  let isColumnActive = true;
  let isAscendingActive = false;
  let isDescendingActive = false;

  if (sortedColumn) {
    switch (sortedColumn.order) {
      case 'ascend':
        isAscendingActive = true;
        isDescendingActive = !isAscendingActive;
        break;
      case 'descend':
        isDescendingActive = true;
        isAscendingActive = !isDescendingActive;
        break;
      default:
        isColumnActive = false;
        isAscendingActive = false;
        isDescendingActive = false;
        break;
    }
  }

  return (
    <div className={classNames('title-container', { active: sortedColumn && isColumnActive })}>
      <span className="text">{title}</span>
      <div className="sort-icon">
        <LineCaretUpIcon className={classNames({ 'ascending-active': sortedColumn && isAscendingActive })} />
        <LineCaretDownIcon className={classNames({ 'descending-active': sortedColumn && isDescendingActive })} />
      </div>
    </div>
  );
};

export const getCategorySeparatorOfTable = () => {
  return (
    <span className="text-nowrap">
      &nbsp;&nbsp;&nbsp;
      <ArrowRightIcon />
      &nbsp;&nbsp;&nbsp;
    </span>
  );
};
