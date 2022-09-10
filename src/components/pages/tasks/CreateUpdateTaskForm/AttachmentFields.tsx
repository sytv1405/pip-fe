import React, { useState, useRef } from 'react';
import { ModalProps, Upload } from 'antd';
import { useFieldArray, useFormContext } from 'react-hook-form';
import classNames from 'classnames';
import { RcFile } from 'antd/lib/upload';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { Storage } from 'aws-amplify';
import { UploadFile } from 'antd/lib/upload/interface';

import { getS3FileUrl } from '@/utils/fileUtils';
import { Trans, useTranslation } from 'i18next-config';
import { Field, Label } from '@/components/form';
import { ModalInfo } from '@/components/modal';
import { FilePlusIcon, TrashThinIcon } from '@/assets/images';
import FileDynamicIcon from '@/components/FileDynamicIcon';
import message from '@/utils/message';

import styles from './styles.module.scss';

const AttachmentFields = () => {
  const [t] = useTranslation('task');
  const [modalConfirmDelete, setModalConfirmDelete] = useState<ModalProps>(null);
  const [modalDeleteSuccess, setModalDeleteSuccess] = useState<ModalProps>(null);
  const isUploadingRef = useRef(false);

  const { control, watch, setValue, trigger } = useFormContext();
  const { remove } = useFieldArray({
    control,
    keyName: 'key',
    name: 'taskAttachments',
  });

  const handleUploadFile = async ({ file, onError, onSuccess, onProgress }: UploadRequestOption) => {
    const fileName = (file as RcFile).name;

    try {
      await Storage.put(fileName, file, {
        level: 'public',
        progressCallback(progress) {
          onProgress(progress);
        },
      });
      onSuccess(fileName);
    } catch (error) {
      message.error(t('common:message_upload_file_error'));
      onError(error);
    }
  };

  return (
    <div>
      <Label strong>{t('attachments')}</Label>
      <div>
        <Upload
          className={classNames(styles.upload, 'mb-4')}
          multiple
          fileList={watch('taskAttachments') || []}
          customRequest={handleUploadFile}
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
          itemRender={(originNode, file, currentFileList) => {
            const index = currentFileList.indexOf(file);

            return (
              <>
                {originNode}
                <Field type="hidden" name={`taskAttachments.${index}.size`} />
              </>
            );
          }}
          onChange={({ fileList }: { fileList: (UploadFile<any> & { id?: number })[] }) => {
            if (fileList.some(file => file.status === 'uploading')) {
              isUploadingRef.current = true;

              setValue(
                'taskAttachments',
                fileList.filter(item => item.status !== 'error')
              );
            } else {
              if (isUploadingRef.current) {
                isUploadingRef.current = false;
                message.success(t('common:message_upload_file_success'));
              }
              setValue(
                'taskAttachments',
                fileList
                  .filter(item => item.status !== 'error')
                  .map(item => ({
                    id: item.id,
                    name: item.response || item.name,
                    url: item.percent !== 0 ? getS3FileUrl(item.response || item.name) : null,
                    size: item.size,
                  }))
              );
            }
            trigger('taskAttachments');
          }}
          onRemove={file => {
            setModalConfirmDelete({
              visible: true,
              onOk: async () => {
                const index = watch('taskAttachments').indexOf(file);
                remove(index);
                setModalConfirmDelete(null);
                setModalDeleteSuccess({
                  visible: true,
                  onOk: () => setModalDeleteSuccess(null),
                  onCancel: () => setModalDeleteSuccess(null),
                });
              },
              onCancel: () => setModalConfirmDelete(null),
            });
            return false;
          }}
        >
          <div className={classNames(styles.upload_area)}>
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
        </Upload>
        <div className="text-center">
          <Field type="hidden" name="taskAttachmentsError" />
        </div>
      </div>
      <ModalInfo title={t('delete_attachment')} okText={t('common:delete')} {...modalConfirmDelete}>
        {t('delete_attachment_confirm_message')}
      </ModalInfo>
      <ModalInfo title={t('delete_attachment')} okText={t('common:button_close')} closable={false} {...modalDeleteSuccess}>
        {t('delete_attachment_success_message')}
      </ModalInfo>
    </div>
  );
};

export default AttachmentFields;
