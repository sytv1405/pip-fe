import { Button, Modal, Typography } from 'antd';
import { FC } from 'react';
import classNames from 'classnames';

import { useTranslation } from 'i18next-config';
import { EllipseIcon } from '@/assets/images';

import styles from '../../styles.module.scss';

export type Props = {
  isVisible: boolean;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
};

export const Layout: FC<Props> = ({ isVisible, onOk }) => {
  const [t] = useTranslation(['business_unit']);

  return (
    <Modal
      width="856px"
      className="mt-4 modal-pd-35 modal-footer-center"
      title={t('upload_excel_success')}
      centered
      visible={isVisible}
      onCancel={onOk}
      footer={[
        <Button type="primary" onClick={onOk} className="mn-w180p font-weight-bold" size="large">
          {t('common:button_close')}
        </Button>,
      ]}
    >
      <Typography.Title className="mb-0 mt-px-10" level={5}>
        {t('upload_sub_5')}
      </Typography.Title>
      <Typography.Paragraph className="mb-0">
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" />
          {t('upload_sub_5_detail')}
        </p>
      </Typography.Paragraph>

      <Typography.Title className="mb-0 mt-3" level={5}>
        {t('upload_excel_success_sub_1')}
      </Typography.Title>
      <Typography.Paragraph className="mb-0">
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" />
          {t('upload_excel_success_des_1')}
        </p>
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" />
          {t('upload_excel_success_des_2')}
        </p>
      </Typography.Paragraph>

      <Typography.Title className="mb-0" level={5}>
        {t('upload_excel_success_sub_2')}
      </Typography.Title>
      <Typography.Paragraph className="mb-0">
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_3')}
        </p>
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_4')}
        </p>
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_5')}
        </p>
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_6')}
        </p>
      </Typography.Paragraph>

      <Typography.Title className="mb-0" level={5}>
        {t('upload_excel_success_sub_3')}
      </Typography.Title>
      <Typography.Paragraph>
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_7')}
        </p>
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_8')}
        </p>
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_9')}
        </p>
      </Typography.Paragraph>

      <Typography.Title className="mb-0" level={5}>
        {t('upload_excel_success_sub_4')}
      </Typography.Title>
      <Typography.Paragraph className="mb-0">
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_10')}
        </p>
        <div className={classNames(styles['sub-gray-zone'], 'mt-2 mb-4 ml-px-15')}>
          <div className="mr-1">{t('business_unit_example')}</div>
          {t('upload_excel_success_des_11')}
        </div>
        <p className={classNames(styles['upload-sub'], 'mb-0')}>
          <EllipseIcon className="mr-2" /> {t('upload_excel_success_des_12')}
        </p>
        <div className={classNames(styles['sub-gray-zone'], 'mt-2 ml-px-15')}>
          <div className="mr-1">{t('business_unit_example')}</div>
          {t('upload_excel_success_des_13')}
        </div>
      </Typography.Paragraph>
    </Modal>
  );
};
