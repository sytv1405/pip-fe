import { Select } from 'antd';
import React from 'react';
import classNames from 'classnames';

import { Department, Objectliteral } from '@/types';
import { Label } from '@/components/form';
import { DownIcon } from '@/assets/images';

import styles from './styles.module.scss';

type SelectBusinessProps = {
  t: (key: string, options?: Objectliteral) => string;
  department: Department;
  selectedValue?: string;
  onSelect: (value: string, option: any) => void;
};

const SelectBusiness = ({ t, department, selectedValue, onSelect }: SelectBusinessProps) => {
  return (
    <div className={classNames(styles['business-select-section'])}>
      <Label className="mb-0 mr-px-10 text-nowrap font-size-14 font-weight-medium">{t('business')}</Label>
      <Select
        onChange={onSelect}
        value={selectedValue || JSON.stringify({ departmentId: department?.id })}
        className={styles['business-select']}
        size="large"
        suffixIcon={<DownIcon />}
      >
        {department?.hasTaskNoUnit ? (
          <Select.OptGroup label={t('all_task_of_department', { departmentName: department?.name })}>
            <Select.Option value={JSON.stringify({ departmentId: department?.id })}>{t('common:all')}</Select.Option>
            <Select.Option value={JSON.stringify({ departmentId: department?.id, onlyBelongToDepartment: true })}>
              {t('no_business_unit')}
            </Select.Option>
          </Select.OptGroup>
        ) : (
          <Select.Option value={JSON.stringify({ departmentId: department?.id })}>
            {t('all_task_of_department', { departmentName: department?.name })}
          </Select.Option>
        )}
        {department?.majorCategories?.map(majorCategory => (
          <Select.OptGroup label={majorCategory.name} key={`major-${majorCategory.id}`}>
            <Select.Option value={JSON.stringify({ departmentId: department?.id, majorCategoryId: majorCategory.id })}>
              {t('all_major_category')}
            </Select.Option>
            {majorCategory.hasTaskNoUnit && (
              <Select.Option
                value={JSON.stringify({ departmentId: department?.id, majorCategoryId: majorCategory.id, onlyBelongToMajor: true })}
              >
                {t('belong_to_only_major', { majorName: majorCategory.name })}
              </Select.Option>
            )}
            {majorCategory.middleCategories?.map(middleCategory => (
              <Select.Option
                key={`middle-${middleCategory.id}`}
                value={JSON.stringify({
                  departmentId: department?.id,
                  majorCategoryId: majorCategory.id,
                  middleCategoryId: middleCategory.id,
                })}
              >
                {middleCategory.name}
              </Select.Option>
            ))}
          </Select.OptGroup>
        ))}
      </Select>
    </div>
  );
};

export default SelectBusiness;
