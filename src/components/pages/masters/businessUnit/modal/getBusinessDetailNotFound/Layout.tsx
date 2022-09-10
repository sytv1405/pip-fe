import { Button, Modal, Typography } from 'antd';
import { FC } from 'react';

import { useTranslation } from 'i18next-config';

export type Props = {
  isVisible: boolean;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
};

export const Layout: FC<Props> = ({ isVisible, onOk }) => {
  const [t] = useTranslation(['business_unit']);

  return (
    <Modal
      className="modal-confirm modal-footer-center"
      title={t('title_modal_edit')}
      centered
      visible={isVisible}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="back" onClick={onOk} type="primary" className="mn-w150p">
          {t('common:button_close')}
        </Button>,
      ]}
    >
      <Typography.Paragraph className="mb-0">{t('business_detail_not_found')}</Typography.Paragraph>
    </Modal>
  );
};
