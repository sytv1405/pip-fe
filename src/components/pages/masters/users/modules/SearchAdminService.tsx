import { Button, Row, Col } from 'antd';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { Field, Form, Label } from '@/components/form';
import { USER_ROLE_SERVICE } from '@/shared/constants/user';
import { Department, Organization } from '@/types';
import { translateOptions } from '@/utils/selects';

import styles from './styles.module.scss';

type SearchProps = {
  departments: Department[];
  organizations: Organization[];
  dispatchGetUserManagement: (params) => void;
  onSelectOrganization: (value) => void;
};

export const Search = ({ departments, organizations, dispatchGetUserManagement, onSelectOrganization }: SearchProps) => {
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
        organizationIds: values?.organizationIds ? [values.organizationIds] : [],
      },
    });
  };

  const handleClear = () => {
    dispatchGetUserManagement({ params: {} });
    form.reset();
    setFormKey(Date.now());
  };

  const handleSelectOrganization = useCallback(
    value => {
      onSelectOrganization(value);
    },
    [onSelectOrganization]
  );

  return (
    <>
      <Form form={form} onSubmit={handleSubmit}>
        <Row justify="space-between" gutter={24}>
          <Col span={8}>
            <Label>
              <b>{t('organization_label')}</b>
            </Label>
            <Field
              key={formKey}
              type="singleSelect"
              name="organizationIds"
              onChange={organizationId => {
                if (organizationId !== form.getValues('organizationIds')) {
                  form.setValue('departmentIds', []);
                  handleSelectOrganization(organizationId);
                }
              }}
              options={organizations.map(record => ({
                label: record.name,
                value: record.id.toString(),
              }))}
            />
          </Col>
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
              options={translateOptions(USER_ROLE_SERVICE, t, 'common')}
              className="mb-3"
              style={{ minWidth: '200px' }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
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
