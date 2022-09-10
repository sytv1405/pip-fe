import { useFieldArray, useFormContext } from 'react-hook-form';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Card, Col, ModalProps, Row } from 'antd';
import { useState } from 'react';

import { useTranslation } from 'i18next-config';
import { Field, Label } from '@/components/form';
import { ModalInfo } from '@/components/modal';
import { DragIcon, PlusIcon, TrashIcon } from '@/assets/images';

import styles from './styles.module.scss';

const TaskProcessFields = () => {
  const [t] = useTranslation('task');
  const [modalConfirmDelete, setModalConfirmDelete] = useState<ModalProps>(null);
  const [modalDeleteSuccess, setModalDeleteSuccess] = useState<ModalProps>(null);

  const { control } = useFormContext();

  const { fields, append, remove, move } = useFieldArray({
    control,
    keyName: 'key',
    name: 'taskProcesses',
  });

  return (
    <>
      <DragDropContext onDragEnd={({ source, destination }) => move(source.index, destination.index)}>
        <Droppable droppableId="taskProcesses">
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={field.key} draggableId={field.key.toString()} index={index}>
                  {draggableProvided => (
                    <div {...draggableProvided.draggableProps} ref={draggableProvided.innerRef}>
                      <Card size="small" className={styles['gray-card']} bordered={false}>
                        <Row gutter={20} align="middle">
                          <Col flex="0 0 20px">
                            <div {...draggableProvided.dragHandleProps}>
                              <DragIcon />
                            </div>
                          </Col>
                          <Col flex={1}>
                            <Row className="mb-3" gutter={4}>
                              <Col flex="0 0 70px" className="pt-2">
                                <Label strong size="small">
                                  {t('process_name')}
                                </Label>
                              </Col>
                              <Col flex={1}>
                                <Field
                                  type="text"
                                  id={`taskProcesses.${index}.content`}
                                  name={`taskProcesses.${index}.content`}
                                  size="large"
                                />
                              </Col>
                            </Row>
                            <Row gutter={4}>
                              <Col flex="0 0 70px" className="pt-2">
                                <Label strong size="small">
                                  {t('process_description')}
                                </Label>
                              </Col>
                              <Col flex={1}>
                                <Field
                                  type="textArea"
                                  id={`taskProcesses.${index}.outcome`}
                                  name={`taskProcesses.${index}.outcome`}
                                  className={styles['textarea-field--small']}
                                />
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
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <div className="text-center mb-4">
          <Button
            className={styles['button-add']}
            onClick={() =>
              append({
                content: '',
                outcome: '',
              })
            }
          >
            {t('button_add_process')} <PlusIcon />
          </Button>
        </div>
      </DragDropContext>
      <ModalInfo title={t('delete_process')} okText={t('common:delete')} {...modalConfirmDelete}>
        {t('delete_process_confirm_message')}
      </ModalInfo>
      <ModalInfo title={t('delete_process')} okText={t('common:button_close')} closable={false} {...modalDeleteSuccess}>
        {t('delete_process_success_message')}
      </ModalInfo>
    </>
  );
};

export default TaskProcessFields;
