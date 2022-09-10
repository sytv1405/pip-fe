import React, { useMemo } from 'react';
import { range } from 'lodash';
import { Col } from 'antd';

import { Task } from '@/types';
import { convertObjectToOptions } from '@/utils/convertUtils';
import { useTranslation } from 'i18next-config';
import { Field } from '@/components/form';
import { CalendarOutlineIcon } from '@/assets/images';

import { weekDays, taskPeriodTypes, months } from '../constants';

import styles from './styles.module.scss';

type Props = {
  type: Task['periodType'];
  disabled;
};

const PeriodPicker = ({ type, disabled }: Props) => {
  const [t] = useTranslation('task');

  const dayOptions = useMemo(
    () => [
      {
        label: t('common:early_of_month'),
        value: 41,
      },
      {
        label: t('common:middle_of_month'),
        value: 42,
      },
      {
        label: t('common:late_of_month'),
        value: 43,
      },
      {
        label: t('common:begin_of_month'),
        value: 0,
      },
      ...range(1, 32).map(num => ({
        label: t('common:num_of_month', { num }),
        value: num,
      })),
      {
        label: t('common:end_of_month'),
        value: 99,
      },
    ],
    [t]
  );

  switch (type) {
    case taskPeriodTypes.weekly:
      return (
        <Col span={6}>
          <Field
            key={type}
            type="select"
            size="large"
            name="taskWeeklyPeriods.0.weekCode"
            className={styles['expanded-field']}
            options={convertObjectToOptions(weekDays, {
              transformKey: key => t(`common:${key}`),
            })}
            disabled={disabled}
            allowClear
            valueOnClear={null}
          />
        </Col>
      );
    case taskPeriodTypes.monthly:
      return (
        <Col span={6}>
          <Field
            key={type}
            type="select"
            size="large"
            name="taskMonthlyPeriods.0.specifiedDay"
            className={styles['expanded-field']}
            options={dayOptions}
            disabled={disabled}
            allowClear
            valueOnClear={null}
          />
        </Col>
      );
    case taskPeriodTypes.monthlyNo:
      return (
        <>
          <Col span={6}>
            <Field
              key={type}
              type="select"
              size="large"
              name="taskMonthlyPeriods.0.specifiedNo"
              className={styles['expanded-field']}
              options={range(1, 5).map(no => ({
                label: t(`monthly_no_${no}`),
                value: no,
              }))}
              disabled={disabled}
              allowClear
              valueOnClear={null}
            />
          </Col>
          <Col span={6}>
            <Field
              key={type}
              type="select"
              size="large"
              name="taskMonthlyPeriods.0.weekCode"
              className={styles['expanded-field']}
              options={convertObjectToOptions(weekDays, {
                transformKey: key => t(`common:${key}`),
              })}
              disabled={disabled}
              allowClear
              valueOnClear={null}
            />
          </Col>
        </>
      );
    case taskPeriodTypes.annually:
      return (
        <>
          <Col span={6}>
            <Field
              key={type}
              type="select"
              size="large"
              name="taskAnnuallyPeriods.0.specifiedMonth"
              className={styles['expanded-field']}
              options={convertObjectToOptions(months, {
                transformKey: key => t(`common:${key}`),
              })}
              disabled={disabled}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Field
              key={type}
              type="select"
              size="large"
              name="taskAnnuallyPeriods.0.specifiedDay"
              className={styles['expanded-field']}
              options={dayOptions}
              disabled={disabled}
              allowClear
              valueOnClear={null}
            />
          </Col>
        </>
      );
    case taskPeriodTypes.annuallyNo:
      return (
        <>
          <Col span={6}>
            <Field
              key={type}
              type="select"
              size="large"
              name="taskAnnuallyPeriods.0.specifiedMonth"
              className={styles['expanded-field']}
              options={convertObjectToOptions(months, {
                transformKey: key => t(`common:${key}`),
              })}
              disabled={disabled}
              allowClear
              valueOnClear={null}
            />
          </Col>
          <Col span={6}>
            <Field
              key={type}
              type="select"
              size="large"
              name="taskAnnuallyPeriods.0.specifiedNo"
              className={styles['expanded-field']}
              options={range(1, 5).map(no => ({
                label: t(`monthly_no_${no}`),
                value: no,
              }))}
              disabled={disabled}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Field
              key={type}
              type="select"
              size="large"
              name="taskAnnuallyPeriods.0.weekCode"
              className={styles['expanded-field']}
              options={convertObjectToOptions(weekDays, {
                transformKey: key => t(`common:${key}`),
              })}
              disabled={disabled}
              allowClear
              valueOnClear={null}
            />
          </Col>
        </>
      );
    case taskPeriodTypes.specified:
      return (
        <Col span={6}>
          <Field
            type="datePicker"
            name="taskSpecifiedPeriods.0.specifiedOn"
            disabled={disabled}
            size="large"
            suffixIcon={<CalendarOutlineIcon />}
          />
        </Col>
      );
    default:
      return null;
  }
};

export default PeriodPicker;
