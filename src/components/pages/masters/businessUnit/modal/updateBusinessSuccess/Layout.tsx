import { Button, Modal } from 'antd';
import { FC } from 'react';

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
      centered
      visible={isVisible}
      footer={[
        <Button key="submit" type="primary" onClick={onOk} className="min-width-px-270 font-weight-bold mb-px-15" size="large">
          {t('btn_back_business_master')}
        </Button>,
      ]}
      maskClosable={true}
      closable={true}
      width="600px"
      onCancel={onCancel}
    >
      <p className="text-center text-normal mb-0 mt-px-35">{t('message_modal_edit')}</p>
    </Modal>
  );
};
