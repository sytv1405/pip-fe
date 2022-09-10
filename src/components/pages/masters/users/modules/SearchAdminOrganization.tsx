import { Button, Row, Col } from 'antd';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { Field, Form, Label } from '@/components/form';
import { USER_ROLE_ORGANIZATION } from '@/shared/constants/user';
import { Department } from '@/types';
import { translateOptions } from '@/utils/selects';

import styles from './styles.module.scss';

type SearchProps = {
  departments: Department[];
  dispatchGetUserManagement: (params) => void;
};

export const Search = ({ departments, dispatchGetUserManagement }: SearchProps) => {
  const [t] = useTranslation(['user_management', 'common']);

  const [formKey, setFormKey] = useState(Date.now());

  const form = useForm({
    resolver: yupResolver(
      yup.object().shape({
        keyword: yup.string().max(50, t('common:message_max_length', { max: 50 })),
      })
    ),
  });

  const handleSubmit = values => {
    dispatchGetUserManagement({
      params: {
        keyword: values.keyword || '',
        roles: values.roles || [],
        departmentIds: values.departmentIds || [],
      },
    });
  };

  const handleClear = () => {
    dispatchGetUserManagement({ params: {} });
    form.reset();
    setFormKey(Date.now());
  };

  return (
    <>
      <Form form={form} onSubmit={handleSubmit}>
        <Row gutter={24}>
          <Col span={8}>
            <Label>
              <b>{t('apply_label')}</b>
            </Label>
            <Field
              key={formKey}
              type="multiSelect"
              name="departmentIds"
              options={departments?.map(record => ({
                label: record?.name,
                value: record?.id?.toString(),
              }))}
            />
          </Col>
          <Col span={8}>
            <Label>
              <b>{t('author_label')}</b>
            </Label>
            <Field
              key={formKey}
              type="multiSelect"
              name="roles"
              options={translateOptions(USER_ROLE_ORGANIZATION, t, 'common')}
              placeholder={t('common:please_select')}
              className="mb-3"
              style={{ minWidth: '200px' }}
            />
          </Col>
          <Col span={8}>
            <Label>
              <b>{t('user_name_search')}</b>
            </Label>
            <Field
              type="text"
              name="keyword"
              id="keyword"
              className={classNames(styles['input-keyword'], 'mb-3', 'border-input')}
              allowClear
            />
          </Col>
        </Row>
        <Row gutter={12} justify="center">
          <Col>
            <Button type="default" htmlType="button" className="mn-w180p font-weight-bold" onClick={handleClear} size="large">
              {t('common:button_clear_search')}
            </Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" className="mn-w180p font-weight-bold" size="large">
              {t('common:button_search')}
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};
