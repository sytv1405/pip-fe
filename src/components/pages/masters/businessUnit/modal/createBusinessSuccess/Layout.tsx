import { Button, Modal, Typography } from 'antd';
import { FC } from 'react';

import { useTranslation } from 'i18next-config';

export type Props = {
  isVisible: boolean;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  businessLevel: string;
  businessName: string;
};

export const Layout: FC<Props> = ({ isVisible, onOk, businessLevel, businessName }) => {
  const [t] = useTranslation(['business_unit']);

  return (
    <Modal
      className="modal-confirm modal-footer-center"
      width="50%"
      title={t('title_modal_create')}
      centered
      visible={isVisible}
      onCancel={onOk}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="back" size="large" onClick={onOk} type="primary" className="mn-w150p font-weight-bold text-normal">
          {t('common:button_close')}
        </Button>,
      ]}
    >
      <Typography.Paragraph className="mb-0">{t('subtitle_modal_create')}</Typography.Paragraph>
      <Typography.Paragraph className="mb-0">
        {t('business_level')}：{businessLevel}
      </Typography.Paragraph>
      <Typography.Paragraph>
        {t('business_name')}：{businessName}
      </Typography.Paragraph>
      <Typography.Paragraph className="mb-0">{t('note_modal_create_search')}</Typography.Paragraph>
      <Typography.Paragraph>{t('note_modal_create_registration')}</Typography.Paragraph>
    </Modal>
  );
};
