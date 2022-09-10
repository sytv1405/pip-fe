import { Typography } from 'antd';
import { FC } from 'react';

import { useTranslation } from 'i18next-config';
import { ModalInfo } from '@/components/modal';

export type Props = {
  numberOfBusiness: number;
  isVisible: boolean;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
};

export const Layout: FC<Props> = ({ numberOfBusiness, isVisible, onOk }) => {
  const [t] = useTranslation(['business_unit']);

  return (
    <ModalInfo
      title={t('title_modal_create')}
      okText={t('common:button_close')}
      visible={isVisible}
      onOk={onOk}
      onCancel={onOk}
      width={600}
    >
      <Typography.Paragraph className="mb-0">{t('create_bulk_business_sub_1')}</Typography.Paragraph>
      <Typography.Paragraph>{t('create_bulk_business_sub_2', { numberOfBusiness })}</Typography.Paragraph>
      <Typography.Paragraph className="mb-0">{t('create_bulk_business_sub_3')}</Typography.Paragraph>
      <Typography.Paragraph>{t('create_bulk_business_sub_4')}</Typography.Paragraph>
    </ModalInfo>
  );
};
