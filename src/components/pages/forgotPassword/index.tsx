import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';
import { isString } from 'lodash';
import { Button } from 'antd';
import { translate } from '@aws-amplify/ui';
import { PasswordField, TextField } from '@aws-amplify/ui-react';
import classNames from 'classnames';

import { Form } from '@/components/form';
import { Logo } from '@/assets/images';
import { useTranslation } from 'i18next-config';
import message from '@/utils/message';
import { paths } from '@/shared/paths';

import styles from './styles.module.scss';

const ForgotPassword = () => {
  const [t] = useTranslation();
  const siteTitle = useMemo(() => (process.env.NEXT_PUBLIC_ENV === 'staging' ? `[Staging] ${t('site_title')}` : t('site_title')), [t]);
  const { query } = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [isResendingCode, setResendingCode] = useState(false);

  const form = useForm();

  // eslint-disable-next-line camelcase
  const handleSubmit = async ({ code, new_password }) => {
    try {
      setSubmitting(true);
      await Auth.forgotPasswordSubmit(query.email as string, code, new_password);
      await Auth.signOut();
      window.location.replace(paths.home);
    } catch (error) {
      message.error(translate(error?.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendingCode(true);
      await Auth.forgotPassword(query.email as string);
    } catch (error) {
      message.error(translate(error?.message));
    } finally {
      setResendingCode(false);
    }
  };

  if (!query.email || !isString(query.email)) {
    return null;
  }

  return (
    <div className={styles.container} data-amplify-authenticator>
      <Head>
        <title>{`${t('title_reset_password')} | ${siteTitle}`}</title>
      </Head>
      <Logo className={styles.logo} />
      <Form form={form} onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>{t('title_reset_password')}</h2>
        <div className={styles['field-container']}>
          <TextField label={t('enter_code')} type="number" {...form.register('code')} placeholder={t('enter_code_placeholder')} />
        </div>
        <div className={classNames(styles['field-container'], styles['field-container--password'])}>
          <PasswordField
            label={t('enter_newpass')}
            {...form.register('new_password')}
            placeholder={t('enter_newpass_placeholder')}
            autoComplete="new-password"
          />
          <div className={styles.note}>{t('password_note')}</div>
        </div>
        <div className={styles['field-container']}>
          <PasswordField
            label={t('enter_newpass_confirm')}
            {...form.register('new_password_confirm')}
            placeholder={t('enter_newpass_confirm_placeholder')}
            autoComplete="new-password"
          />
        </div>
        <div className="text-center mb-1">
          <Button loading={isSubmitting} type="primary" size="large" htmlType="submit">
            {translate('Change Password')}
          </Button>
        </div>
        <div className="text-center">
          <Button
            className="d-inline-flex align-items-center"
            loading={isResendingCode}
            type="link"
            onClick={handleResendCode}
            icon={<img src="/icon-right-green.svg" className="mr-2" />}
          >
            {translate('Resend Code')}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ForgotPassword;
