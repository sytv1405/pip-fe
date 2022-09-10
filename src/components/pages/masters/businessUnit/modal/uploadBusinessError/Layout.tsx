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
      width="50%"
      title={t('title_modal_create')}
      centered
      visible={isVisible}
      onCancel={onOk}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="back" onClick={onOk} type="primary" className="mn-w150p">
          閉じる
        </Button>,
      ]}
    >
      <Typography.Paragraph className="mb-0 text-pre-line">{t('validate_file_length')}</Typography.Paragraph>
    </Modal>
  );
};
