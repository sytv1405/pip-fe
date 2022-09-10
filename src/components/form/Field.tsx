import {
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  InputNumberProps,
  InputProps,
  Radio,
  Select,
  SelectProps,
  Space,
  SpaceProps,
} from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { get, pick, isUndefined, omit } from 'lodash';
import { TextAreaProps } from 'antd/lib/input';
import moment from 'moment';

import { DownIcon } from '@/assets/images';

import MultiSelect from '../MultiSelect';
import SingleSelect, { SingleSelectProps } from '../SingleSelect';

type ControlProps = Omit<FieldProps, 'className'>;

const Control = ({ type = 'text', name, ...rest }: ControlProps) => {
  const { control, watch } = useFormContext();

  switch (type) {
    case 'datePicker':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const value = watch(name);

            return (
              <DatePicker
                {...field}
                {...pick(rest, ['placeholder', 'disabled', 'size', 'format', 'suffixIcon'])}
                className="w-100"
                value={value ? moment(value) : undefined}
                onChange={date => {
                  field.onChange(date?.toISOString());
                }}
                onBlur={field.onBlur}
              />
            );
          }}
        />
      );

    case 'textArea':
      return <Controller name={name} control={control} render={({ field }) => <Input.TextArea {...rest} {...field} />} />;
    case 'multiSelect':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <MultiSelect
              {...rest}
              {...field}
              value={watch(name)}
              onChange={newValue => {
                rest.onChange?.(newValue);
                field.onChange?.(newValue);
              }}
            />
          )}
        />
      );
    case 'singleSelect':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <SingleSelect
              {...rest}
              {...field}
              value={watch(name)}
              onChange={newValue => {
                rest.onChange?.(newValue);
                field.onChange?.(newValue);
              }}
            />
          )}
        />
      );
    case 'select':
      return (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              {...rest}
              {...field}
              value={watch(name)}
              onChange={newValue => {
                rest.onChange?.(newValue);
                field.onChange?.(!isUndefined(newValue) ? newValue : rest.valueOnClear);
              }}
              suffixIcon={<DownIcon />}
            />
          )}
        />
      );
    case 'number':
      return <Controller name={name} control={control} render={({ field }) => <InputNumber type={type} {...rest} {...field} />} />;
    case 'radioGroup':
      return (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Radio.Group
              {...omit(rest, ['options', 'direction'])}
              {...field}
              onChange={newValue => {
                rest.onChange?.(newValue);
                field.onChange?.(newValue);
              }}
            >
              <Space direction={rest.direction as SpaceProps['direction']}>
                {rest.options?.map(option => (
                  <Radio value={option.value}>{option.label}</Radio>
                ))}
              </Space>
            </Radio.Group>
          )}
        />
      );
    case 'checkboxGroup':
      return (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Checkbox.Group
              {...omit(rest, ['options', 'direction'])}
              {...field}
              onChange={newValue => {
                rest.onChange?.(newValue);
                field.onChange?.(newValue);
              }}
            >
              <Space direction={rest.direction as SpaceProps['direction']}>
                {rest.options?.map(option => (
                  <Checkbox value={option.value}>{option.label}</Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          )}
        />
      );
    default:
      return <Controller name={name} control={control} render={({ field }) => <Input type={type} {...rest} {...field} />} />;
  }
};

type FieldProps = InputProps &
  TextAreaProps &
  SelectProps<any> &
  InputNumberProps &
  SingleSelectProps & {
    type: string;
    name: string;
    className?: string;
    onChange?: (value: any) => void;
    valueOnClear?: any;
    format?: (value: any) => string;
  };

const Field = ({ type, name, className, ...rest }: FieldProps) => {
  const {
    formState: { errors },
  } = useFormContext();
  const errorMessage = get(errors, name)?.message;

  return (
    <div className={classNames({ 'ant-form-item-has-error': !!errorMessage }, className, 'border-input')}>
      <Control type={type} name={name} {...rest} />
      {!!errorMessage && <div className="ant-form-item-explain ant-form-item-explain-error">{errorMessage}</div>}
    </div>
  );
};

export default Field;
