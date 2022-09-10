import { Input, Typography } from 'antd';
import { useState, FC, useEffect } from 'react';
import classNames from 'classnames';

import { SearchIcon } from '@/assets/images';

import styles from './styles.module.scss';

type Value = string | number;

type Option = Record<string, any>;

export type MultiSelectProps = {
  defaultOption?: Option;
  options?: Option[];
  value?: Value[];
  onChange?: (values: Value[]) => void;
  className?: string;
  disabled?: boolean;
};

const MultiSelect: FC<MultiSelectProps> = ({ value: valueProp, defaultOption, options, onChange, className, disabled }) => {
  const [selectedOptionValues, setSelectedOptionValues] = useState(valueProp || []);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleClickOption = (option: Option) => {
    const isSelected = selectedOptionValues.includes(option.value);

    if (isSelected) {
      const newSelectedOptionValues = selectedOptionValues?.filter?.(selectedOptionValue => selectedOptionValue !== option.value);
      setSelectedOptionValues(newSelectedOptionValues || []);
      onChange?.(newSelectedOptionValues);
    } else {
      const newSelectedOptionValues = [...selectedOptionValues, option.value];
      setSelectedOptionValues(newSelectedOptionValues || []);
      onChange?.(newSelectedOptionValues);
    }
  };

  const handleSearch = e => {
    setSearchKeyword(e.target.value);
  };

  useEffect(() => {
    if (disabled) {
      setSelectedOptionValues([]);
      onChange?.([]);
    }
  }, [disabled, onChange]);

  useEffect(() => {
    setSelectedOptionValues(valueProp || []);
  }, [valueProp, setSelectedOptionValues]);

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
      <ul className={classNames(styles.select__list)}>
        {defaultOption && (
          <li
            key={defaultOption.value}
            className={classNames(styles.select__item, {
              [styles['select__item--selected']]: selectedOptionValues.includes(defaultOption.value),
            })}
            onClick={disabled ? undefined : () => handleClickOption(defaultOption)}
          >
            <Typography.Text
              className="d-block"
              ellipsis={{
                tooltip: `${defaultOption.label}`,
              }}
            >
              {defaultOption.label}
            </Typography.Text>
          </li>
        )}
        {options
          .filter(option => (option.label ?? '').toLowerCase().includes((searchKeyword ?? '').toLowerCase()))
          .map(option => (
            <li
              key={option.value}
              className={classNames(styles.select__item, {
                [styles['select__item--selected']]: selectedOptionValues.includes(option.value),
              })}
              onClick={disabled ? undefined : () => handleClickOption(option)}
            >
              <Typography.Text
                className="d-block"
                ellipsis={{
                  tooltip: `${option.label}`,
                }}
              >
                {option.label}
              </Typography.Text>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MultiSelect;
