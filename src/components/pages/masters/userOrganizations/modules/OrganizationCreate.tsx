import { Button, Card, Typography } from 'antd';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';

import { useTranslation } from 'i18next-config';
import { Form, Field, Label } from '@/components/form';
import { Payload } from '@/types';
import { ORGANIZATION_CODE_REGEX } from '@/shared/regex';
import { SectionTitle } from '@/components/Typography';
import { ArrowMarkIcon } from '@/assets/images';
import message from '@/utils/message';

import styles from './styles.module.scss';

type OrganizationCreateProps = {
  isCreateLoading: boolean;
  dispatchGetOrganizations: (payload: Payload) => void;
  dispatchCreateOrganization: (payload: Payload) => void;
};

const OrganizationCreate = ({ isCreateLoading, dispatchGetOrganizations, dispatchCreateOrganization }: OrganizationCreateProps) => {
  const [t] = useTranslation(['user_organizations']);
  const { query } = useRouter();

  const form = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .required(t('common:message_required', { field: t('organization_name') }))
          .max(100, t('common:message_max_length', { max: 100 })),
        organizationCode: yup
          .string()
          .required(t('common:message_required', { field: t('organization_code') }))
          .max(20, t('common:message_max_length', { max: 20 }))
          .matches(ORGANIZATION_CODE_REGEX, t('message_invalid_code')),
      })
    ),
  });

  const handleSubmit = params => {
    dispatchCreateOrganization({
      params,
      callback: () => {
        dispatchGetOrganizations({ params: query });
        message.success(t('message_create_organization_success'));
        form.reset();
      },
      errorCallback: error => {
        message.error(t(`server_error:${error?.errorCode}`));
      },
    });
  };

  return (
    <>
      <SectionTitle icon={<ArrowMarkIcon className="mb-n1" />}>{t('new_organization_registration')}</SectionTitle>
      <Card bordered={false}>
        <Form form={form} className="main-form" onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label strong isRequired htmlFor="name">
              {t('organization_name')}
            </Label>
            <Field type="text" id="name" name="name" className="border-input" size="large" />
          </div>
          <div className="mb-2">
            <Label strong isRequired htmlFor="organizationCode">
              {t('organization_code')}
            </Label>
            <Field type="text" id="organizationCode" name="organizationCode" className="border-input" size="large" />
          </div>
          <Typography.Paragraph className={styles.description}>
            <p className="desc mb-0">{t('registration_form_desc_1')}</p>
            <p className="desc mb-0">{t('registration_form_desc_2')}</p>
            <p className="desc">{t('registration_form_desc_3')}</p>
          </Typography.Paragraph>
          <div className="mt-4 pb-0 flex-center">
            <Button size="large" type="primary" htmlType="submit" className="mn-w180p font-weight-bold" loading={isCreateLoading}>
              {t('common:button_register')}
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};

export default OrganizationCreate;
