import { Button, Typography } from 'antd';
import React from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { Field, Form, Label } from '@/components/form';

import styles from './styles.module.scss';

type OrganizationSearchProps = {
  onSearch: (params?: Record<string, any>) => void;
  onClear: () => void;
};

const OrganizationSearch = ({ onSearch, onClear }: OrganizationSearchProps) => {
  const [t] = useTranslation(['user_organizations']);

  const form = useForm();

  const handleClear = () => {
    form.reset();
    onClear();
  };

  return (
    <Form form={form} className={classNames(styles['search-container'])} onSubmit={onSearch}>
      <Typography.Title level={2} className={classNames(styles['search-title'], 'mb-3')}>
        {t('search_title')}
      </Typography.Title>
      <Label htmlFor="keyword" className={classNames(styles['search-label'])}>
        {t('title_search')}
      </Label>
      <Field type="text" id="keyword" name="keyword" className={classNames(styles['input-keyword'], 'mt-2')} allowClear />
      <div className="mt-4 flex-center">
        <Button size="large" type="default" htmlType="button" className="mn-w180p font-weight-bold" onClick={handleClear}>
          {t('common:button_clear_search')}
        </Button>
        <Button size="large" type="primary" htmlType="submit" className="mn-w180p font-weight-bold ml-4">
          {t('common:button_search')}
        </Button>
      </div>
    </Form>
  );
};

export default OrganizationSearch;
