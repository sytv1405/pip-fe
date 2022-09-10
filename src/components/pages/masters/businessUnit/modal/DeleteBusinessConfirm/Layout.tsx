import { Button, Modal, Typography } from 'antd';
import React, { FC } from 'react';

import { useTranslation } from 'i18next-config';

export type Props = {
  isVisible: boolean;
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
  businessType: string;
  businessName: string;
  isDeleteLoading: boolean;
};

export const Layout: FC<Props> = ({ isVisible, onOk, onCancel, isDeleteLoading, businessType, businessName }) => {
  const [t] = useTranslation(['business_unit']);

  return (
    <Modal
      className="modal-confirm modal-footer-center"
      title={t('delete_business_unit')}
      onCancel={onCancel}
      centered
      visible={isVisible}
      closable={false}
      footer={[
        <Button key="submit" type="primary" onClick={onOk} className="mn-w150p" size="large" loading={isDeleteLoading}>
          {t('delete_label')}
        </Button>,
      ]}
      maskClosable={false}
    >
      <Typography.Paragraph className="mb-0 text-pre-line">
        {t('modal_confirm_delete_business_unit_message', { businessType, businessName })}
      </Typography.Paragraph>
    </Modal>
  );
};
