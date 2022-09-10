import { Button, Modal, ModalProps } from 'antd';
import { FC } from 'react';

const ModalInfo: FC<ModalProps> = ({ onOk, okText, closable, confirmLoading, children, ...rest }) => {
  return (
    <Modal
      className="modal-footer-center"
      centered
      footer={[
        <Button size="large" type="primary" onClick={onOk} className="mn-w180p font-weight-bold" loading={confirmLoading}>
          {okText}
        </Button>,
      ]}
      closable={closable}
      maskClosable={closable}
      {...rest}
    >
      {children}
    </Modal>
  );
};

export default ModalInfo;
