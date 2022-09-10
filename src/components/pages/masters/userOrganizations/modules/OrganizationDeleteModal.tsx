import { Button, Checkbox, Modal, Radio, Space } from 'antd';
import React, { useState } from 'react';

import { useTranslation } from 'i18next-config';
import { Organization } from '@/types';

type OrganizationDeleteModal = {
  onCancel: () => void;
  onOk: ({ isHardDeleted }: { isHardDeleted: boolean }) => void;
  visible: boolean;
  organization: Organization;
};

const OrganizationDeleteModal = ({ onCancel, visible, onOk, organization }: OrganizationDeleteModal) => {
  const [t] = useTranslation('user_organizations');

  const [isHardDeleted, setIsHardDelete] = useState(false);
  const [isApprovedByAdmin, setIsApprovedByAdmin] = useState(false);
  const [isBackedUp, setIsBackedUp] = useState(false);

  return (
    <Modal
      className="modal-confirm modal-footer-center"
      title={t('modal_delete_title')}
      onCancel={onCancel}
      centered
      visible={visible}
      width={1000}
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={() => onOk({ isHardDeleted })}
          size="large"
          disabled={!isApprovedByAdmin || !isBackedUp}
          className="w-auto font-weight-bold"
        >
          {t('modal_delete_btn')}
        </Button>,
      ]}
    >
      <Radio.Group name="isHardDelete" className="mb-3 radio-color-green" onChange={e => setIsHardDelete(e.target.value)}>
        <Space direction="vertical">
          <Radio value={false}>{t('stop_using')}</Radio>
          <Radio value={true}>{t('delete_all')}</Radio>
        </Space>
      </Radio.Group>
      <p className="mb-0">{t('modal_delete_desc_1')}</p>
      <p className="mb-3">{t('modal_delete_desc_2')}</p>
      <p className="mb-3">{t('modal_delete_desc_3')}</p>
      <ul className="reset-list">
        <li className="item py-1">
          <Checkbox onChange={e => setIsApprovedByAdmin(e.target.checked)}>{t('modal_delete_check_1')}</Checkbox>
        </li>
        <li className="item py-1">
          <Checkbox onChange={e => setIsBackedUp(e.target.checked)}>{t('modal_delete_check_2')}</Checkbox>
        </li>
      </ul>
      <p className="mt-3 mb-0 text-center">
        {t('modal_delete_desc_4')}：{organization?.name}
      </p>
    </Modal>
  );
};

export default OrganizationDeleteModal;
