import { Input, Spin, Typography } from 'antd';
import { useState, FC, useEffect, MouseEvent, ChangeEvent, useCallback } from 'react';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';

import { SearchIcon } from '@/assets/images';

import styles from './styles.module.scss';

type Value = string | number;

type Option = Record<string, any>;

export type SingleSelectProps = {
  options?: Option[];
  value?: Value;
  onChange?: (values: Value) => void;
  className?: string;
  disabled?: boolean;
  emptyText?: string;
  loading?: boolean;
  allowClear?: boolean;
};

const SingleSelect: FC<SingleSelectProps> = ({
  value: valueProp,
  options,
  onChange,
  className,
  disabled,
  emptyText,
  loading,
  allowClear,
}) => {
  const [selectedOptionValue, setSelectedOptionValue] = useState(valueProp || null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleClickOption = useCallback(
    (option: Option) => {
      setSelectedOptionValue(option.value);
      onChange?.(option.value);
    },
    [onChange]
  );

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  }, []);

  const handleClear = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      setSelectedOptionValue(null);
      onChange?.(null);
    },
    [onChange]
  );

  useEffect(() => {
    setSelectedOptionValue(valueProp || null);
  }, [valueProp]);

  return (
    <div
      className={classNames(styles.select, className, {
        [styles['select--disabled']]: disabled,
      })}
    >
      <div className={styles.select__input_wrapper}>
        <Input
          allowClear
          name="keyword"
          value={searchKeyword}
          onChange={handleSearch}
          disabled={disabled}
          suffix={<SearchIcon />}
          onPressEnter={e => e.preventDefault()}
        />
      </div>
      {loading ? (
        <Spin indicator={<LoadingOutlined spin />} />
      ) : (
        <>
          {isEmpty(options) ? (
            <div className={styles['empty-text-select']}>{emptyText}</div>
          ) : (
            <ul className={classNames(styles.select__list)}>
              {options
                .filter(option => (option.label ?? '').toLowerCase().includes((searchKeyword ?? '').toLowerCase()))
                .map(option => {
                  const isSelected = selectedOptionValue === option.value;

                  return (
                    <li
                      key={option.value}
                      className={classNames(styles.select__item, {
                        [styles['select__item--selected']]: isSelected,
                      })}
                      onClick={disabled ? undefined : () => handleClickOption(option)}
                    >
                      <Typography.Text
                        className={styles['select__item-label']}
                        ellipsis={{
                          tooltip: option.label,
                        }}
                      >
                        {option.label}
                      </Typography.Text>
                      {allowClear && isSelected && <CloseCircleFilled onClick={handleClear} />}
                    </li>
                  );
                })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default SingleSelect;
