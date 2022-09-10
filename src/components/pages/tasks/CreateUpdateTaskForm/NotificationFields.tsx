import { Button, Card, Col, ModalProps, Row, Upload } from 'antd';
import React, { ReactNode, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Storage } from 'aws-amplify';
import { RcFile } from 'antd/lib/upload';
import classNames from 'classnames';

import { Trans, useTranslation } from 'i18next-config';
import { Field, Label } from '@/components/form';
import { getS3FileUrl } from '@/utils/fileUtils';
import { ModalInfo } from '@/components/modal';
import { FilePlusIcon, PlusIcon, TrashIcon, TrashThinIcon } from '@/assets/images';
import FileDynamicIcon from '@/components/FileDynamicIcon';
import message from '@/utils/message';

import styles from './styles.module.scss';

const NotificationsFields = () => {
  const [t] = useTranslation('task');
  const [modalConfirmDelete, setModalConfirmDelete] = useState<ModalProps & { children: ReactNode }>(null);
  const [modalDeleteSuccess, setModalDeleteSuccess] = useState<ModalProps & { children: ReactNode }>(null);

  const { control, setValue, watch, trigger } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    keyName: 'key',
    name: 'taskNotifications',
  });

  return (
    <div>
      <Label strong>{t('notification')}</Label>
      {fields.map((field, index) => (
        <Card key={field.key} size="small" className={styles['gray-card']} bordered={false}>
          <Row gutter={20} align="middle">
            <Col flex={1}>
              <Row className="mb-3" gutter={10}>
                <Col flex="0 0 70px" className="pt-2">
                  <Label strong size="small">
                    {t('notification')}
                  </Label>
                </Col>
                <Col flex={1}>
                  <Field type="text" size="large" name={`taskNotifications.${index}.name`} />
                </Col>
              </Row>
              <Row className="mb-3" gutter={10}>
                <Col flex="0 0 70px" className="pt-2">
                  <Label strong size="small">
                    {t('document_number')}
                  </Label>
                </Col>
                <Col flex={1}>
                  <Field type="text" size="large" name={`taskNotifications.${index}.documentNo`} className={styles['narrow-field']} />
                </Col>
              </Row>
              <Row gutter={10}>
                <Col flex="0 0 70px" className="pt-2">
                  <Label strong size="small">
                    {t('file')}
                  </Label>
                </Col>
                <Col flex={1}>
                  <Upload
                    className={classNames(styles.upload, styles['upload--notification'])}
                    maxCount={1}
                    iconRender={file => <FileDynamicIcon fileName={file?.name} />}
                    showUploadList={{
                      removeIcon: <TrashThinIcon />,
                    }}
                    beforeUpload={file => {
                      if (file.size > 10 * 1024 * 1024) {
                        return false;
                      }
                      return true;
                    }}
                    fileList={
                      watch(`taskNotifications.${index}.fileName`)
                        ? [
                            {
                              uid: watch(`taskNotifications.${index}.uid`) || watch(`taskNotifications.${index}.fileName`),
                              name: watch(`taskNotifications.${index}.fileName`),
                              url: watch(`taskNotifications.${index}.url`),
                              status: watch(`taskNotifications.${index}.status`),
                            },
                          ]
                        : []
                    }
                    itemRender={originNode => {
                      return (
                        <div>
                          {originNode}
                          <Field type="hidden" name={`taskNotifications.${index}.size`} />
                        </div>
                      );
                    }}
                    customRequest={async ({ file, onError, onSuccess, onProgress }) => {
                      const fileName = (file as RcFile).name;

                      try {
                        await Storage.put(fileName, file, {
                          level: 'public',
                          progressCallback(progress) {
                            onProgress(progress);
                          },
                        });

                        message.success(t('common:message_upload_file_success'));
                        onSuccess(fileName);
                      } catch (error) {
                        message.error(t('common:message_upload_file_error'));
                        onError(error);
                      }
                    }}
                    onChange={({ file }) => {
                      if (file.status === 'uploading') {
                        setValue(`taskNotifications.${index}.fileName`, file.name);
                        setValue(`taskNotifications.${index}.url`, null);
                        setValue(`taskNotifications.${index}.status`, file.status);
                        setValue(`taskNotifications.${index}.uid`, file.uid);
                      } else if (file.status === 'done') {
                        setValue(`taskNotifications.${index}.fileName`, file.response);
                        setValue(`taskNotifications.${index}.url`, getS3FileUrl(file.response));
                        setValue(`taskNotifications.${index}.status`, file.status);
                        setValue(`taskNotifications.${index}.uid`, file.uid);
                        setValue(`taskNotifications.${index}.size`, file.size);

                        trigger(`taskNotifications.${index}.fileName`);
                        trigger(`taskNotifications.${index}.url`);
                        trigger(`taskNotifications.${index}.size`);
                      } else if (file.status === 'error') {
                        setValue(`taskNotifications.${index}.fileName`, null);
                        setValue(`taskNotifications.${index}.url`, null);
                        setValue(`taskNotifications.${index}.status`, null);
                        setValue(`taskNotifications.${index}.uid`, null);
                      } else if (!file.status) {
                        setValue(`taskNotifications.${index}.fileName`, file.name);
                        setValue(`taskNotifications.${index}.url`, null);
                        setValue(`taskNotifications.${index}.uid`, file.uid);
                        setValue(`taskNotifications.${index}.size`, file.size);

                        trigger(`taskNotifications.${index}.fileName`);
                        trigger(`taskNotifications.${index}.url`);
                        trigger(`taskNotifications.${index}.size`);
                      }
                    }}
                    onRemove={() => {
                      setModalConfirmDelete({
                        visible: true,
                        title: t('delete_notification_attachment'),
                        children: t('delete_notification_attachment_confirm_message'),
                        onOk: () => {
                          setValue(`taskNotifications.${index}.fileName`, null);
                          setValue(`taskNotifications.${index}.url`, null);
                          setValue(`taskNotifications.${index}.status`, null);
                          setValue(`taskNotifications.${index}.uid`, null);
                          setValue(`taskNotifications.${index}.size`, null);

                          setModalConfirmDelete(null);
                          setModalDeleteSuccess({
                            visible: true,
                            title: t('delete_notification_attachment'),
                            children: t('delete_notification_attachment_success_message'),
                            onOk: () => setModalDeleteSuccess(null),
                            onCancel: () => setModalDeleteSuccess(null),
                          });
                        },
                        onCancel: () => setModalConfirmDelete(null),
                      });
                      return false;
                    }}
                    openFileDialogOnClick={!watch(`taskNotifications.${index}.fileName`)}
                  >
                    {!watch(`taskNotifications.${index}.fileName`) && (
                      <div className={styles.upload_area}>
                        <FilePlusIcon />
                        <Trans
                          i18nKey="button_attachment"
                          t={t}
                          components={{
                            title: <p className="ant-upload-title" />,
                            subtitle: <p className="ant-upload-subtitle" />,
                          }}
                        />
                      </div>
                    )}
                  </Upload>
                </Col>
              </Row>
            </Col>
            <Col flex="0 0 30px">
              <TrashIcon
                className="cursor-pointer"
                onClick={() =>
                  setModalConfirmDelete({
                    visible: true,
                    title: t('delete_notification'),
                    children: t('delete_notification_confirm_message'),
                    onOk: () => {
                      remove(index);
                      setModalConfirmDelete(null);
                      setModalDeleteSuccess({
                        visible: true,
                        title: t('delete_notification'),
                        children: t('delete_notification_success_message'),
                        onOk: () => setModalDeleteSuccess(null),
                        onCancel: () => setModalDeleteSuccess(null),
                      });
                    },
                    onCancel: () => setModalConfirmDelete(null),
                  })
                }
              />
            </Col>
          </Row>
        </Card>
      ))}
      <div className="text-center">
        <Button
          className={styles['button-add']}
          onClick={() =>
            append({
              name: '',
              documentNo: '',
              fileName: '',
              url: '',
            })
          }
        >
          {t('button_add_notification')} <PlusIcon />
        </Button>
      </div>
      <ModalInfo okText={t('common:delete')} {...modalConfirmDelete} />
      <ModalInfo okText={t('common:button_close')} closable={false} {...modalDeleteSuccess} />
    </div>
  );
};

export default NotificationsFields;
