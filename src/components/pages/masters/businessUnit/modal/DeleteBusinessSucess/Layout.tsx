import { Button, Modal } from 'antd';
import React, { FC } from 'react';

import { useTranslation } from 'i18next-config';

export type Props = {
  isVisible: boolean;
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
};

export const Layout: FC<Props> = ({ isVisible, onOk, onCancel }) => {
  const [t] = useTranslation(['business_unit']);

  return (
    <Modal
      className="modal-confirm modal-footer-center"
      title={t('title_modal_delete')}
      onCancel={onCancel}
      centered
      visible={isVisible}
      closable={false}
      footer={[
        <Button key="submit" type="primary" onClick={onOk} className="mn-w150p" size="large">
          {t('btn_back_business_master')}
        </Button>,
      ]}
      maskClosable={false}
    >
      <p className="mb-0">{t('message_modal_delete_confirm')}</p>
    </Modal>
  );
};
