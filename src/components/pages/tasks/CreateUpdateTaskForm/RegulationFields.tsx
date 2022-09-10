import { Button, Card, Col, ModalProps, Row } from 'antd';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useState } from 'react';

import { useTranslation } from 'i18next-config';
import { Field, Label } from '@/components/form';
import { mapOptions } from '@/utils/selects';
import { Regulation, RegulationType } from '@/types';
import { ModalInfo } from '@/components/modal';
import { PlusIcon, TrashIcon } from '@/assets/images';

import styles from './styles.module.scss';

type RegulationsFieldsProps = {
  regulationTypes: RegulationType[];
  regulations: Regulation[];
};

const RegulationsFields = ({ regulationTypes, regulations }: RegulationsFieldsProps) => {
  const [t] = useTranslation('task');
  const [modalConfirmDelete, setModalConfirmDelete] = useState<ModalProps>(null);
  const [modalDeleteSuccess, setModalDeleteSuccess] = useState<ModalProps>(null);

  const { control, watch, getValues, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    keyName: 'key',
    name: 'taskRegulations',
  });

  return (
    <div>
      <Label strong>{t('regulation')}</Label>
      {fields.map((field, index) => (
        <Card key={field.key} size="small" className={styles['gray-card']} bordered={false}>
          <Row gutter={20} align="middle">
            <Col flex={1}>
              <Row className="mb-3" gutter={10}>
                <Col flex="0 0 70px" className="pt-1">
                  <Label strong size="small">
                    {t('regulation_type')}
                  </Label>
                </Col>
                <Col flex={1}>
                  <Field
                    type="select"
                    size="large"
                    allowClear
                    name={`taskRegulations.${index}.type`}
                    options={mapOptions(regulationTypes, { labelKey: 'name', valueKey: 'id' })}
                    className={styles['narrow-field']}
                    onChange={typeId => {
                      if (typeId !== getValues(`taskRegulations.${index}.type`)) {
                        setValue(`taskRegulations.${index}.regulationId`, '');
                      }
                    }}
                  />
                </Col>
              </Row>
              <Row className="mb-3" gutter={10}>
                <Col flex="0 0 70px" className="pt-1">
                  <Label strong size="small">
                    {t('regulation_name')}
                  </Label>
                </Col>
                <Col flex={1}>
                  <Field
                    type="select"
                    size="large"
                    name={`taskRegulations.${index}.regulationId`}
                    showSearch
                    allowClear
                    filterOption={(inputValue, option) => option.props.label?.toString().toLowerCase().includes(inputValue.toLowerCase())}
                    options={mapOptions(
                      watch(`taskRegulations.${index}.type`)
                        ? regulations.filter(regulation => regulation.regulationType.id === watch(`taskRegulations.${index}.type`))
                        : regulations,
                      {
                        labelKey: 'name',
                        valueKey: 'id',
                      }
                    )}
                    className={styles['narrow-field']}
                  />
                </Col>
              </Row>
              <Row gutter={10}>
                <Col flex="0 0 70px" className="pt-1">
                  <Label strong size="small">
                    {t('remark')}
                  </Label>
                </Col>
                <Col flex={1}>
                  <Field type="textArea" name={`taskRegulations.${index}.memo`} className={styles['textarea-field--small']} />
                </Col>
              </Row>
            </Col>
            <Col flex="0 0 30px">
              <TrashIcon
                className="cursor-pointer"
                onClick={() =>
                  setModalConfirmDelete({
                    visible: true,
                    onOk: () => {
                      remove(index);
                      setModalConfirmDelete(null);
                      setModalDeleteSuccess({
                        visible: true,
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
      <div className="text-center mb-4">
        <Button
          onClick={() =>
            append({
              type: '',
              regulationId: '',
              memo: '',
            })
          }
          className={styles['button-add']}
        >
          {t('button_add_regulation')} <PlusIcon />
        </Button>
      </div>
      <ModalInfo title={t('delete_regulation')} okText={t('common:delete')} {...modalConfirmDelete}>
        {t('delete_regulation_confirm_message')}
      </ModalInfo>
      <ModalInfo title={t('delete_regulation')} okText={t('common:button_close')} closable={false} {...modalDeleteSuccess}>
        {t('delete_regulation_success_message')}
      </ModalInfo>
    </div>
  );
};

export default RegulationsFields;
