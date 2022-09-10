import { Image } from '@aws-amplify/ui-react';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';

import { paths } from '@/shared/paths';
import { useTranslation } from 'i18next-config';

import styles from './styles.module.scss';

const PageNotAllowedOnMobile = () => {
  const [t] = useTranslation();

  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <main className={styles.main}>
        <Image alt="logo" src="/logo-transparent.png" className={styles.logo} />
        {t('message_page_not_allow_in_basic_mode_mobile')}
        <Button type="primary" size="large" className={styles['button-go-home']} onClick={() => router.replace(paths.home)}>
          {t('button_go_home')}
        </Button>
      </main>
      <footer className={styles.footer}>© Shift-Seven Consulting Inc.</footer>
    </div>
  );
};

export default PageNotAllowedOnMobile;
