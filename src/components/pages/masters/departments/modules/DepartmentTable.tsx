import { Button, Modal, ModalProps, Space, Table, TableProps } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import Link from 'next/link';
import { AlignType } from 'rc-table/lib/interface';

import { useTranslation } from 'i18next-config';
import { Department, Payload } from '@/types';
import { ModalInfo } from '@/components/modal';
import { paths } from '@/shared/paths';
import { DragIcon, EditIcon, TrashIcon } from '@/assets/images';

const DragHandle = SortableHandle(() => <DragIcon />);
const SortableItem = SortableElement(props => <tr {...{ ...props, className: `${props.className} department_list__row` }} />);
const SortableBody = SortableContainer(props => <tbody {...props} />);

type DepartmentTableProps = TableProps<any> & {
  isDeleteLoading: boolean;
  dispatchDeleteDepartment: (payload: Payload) => void;
  dispatchBulkUpdateDepartments: (payload: Payload) => void;
  dispatchGetDepartments: () => void;
  disabled: boolean;
};

const DepartmentTable = ({
  disabled,
  dataSource,
  loading,
  isDeleteLoading,
  dispatchDeleteDepartment,
  dispatchGetDepartments,
  dispatchBulkUpdateDepartments,
}: DepartmentTableProps) => {
  const [t] = useTranslation('department_master');
  const [departments, setDepartments] = useState(dataSource?.map((item, index) => ({ ...item, index })));
  const [modalDeleteDepartment, setModalDeleteDepartment] = useState<ModalProps & { department: Department }>(null);
  const [isDeleteSuccessVisible, setIsDeleteSuccessVisible] = useState<boolean>(false);
  const [modalDeleteDepartmentName, setModalDeleteDepartmentName] = useState<string>(null);

  const columns = useMemo(
    () => [
      {
        title: t('sort_by'),
        dataIndex: 'sort',
        width: 30,
        className: 'drag-visible thead-title',
        align: 'center' as AlignType,
        render: () => (
          <Button className="icon-button action-button button-drag" disabled={disabled}>
            <DragHandle />
          </Button>
        ),
      },
      {
        title: t('department_name'),
        dataIndex: 'name',
        className: 'department-name thead-title',
        render: (text, record) => (
          <div className="tbody-field">
            {disabled ? (
              text
            ) : (
              <>
                <Link href={{ pathname: paths.master.departments.edit, query: { id: record.id } }}>
                  <a className="tbody-field text-underline">
                    {text}
                    <EditIcon className="edit-icon" />
                  </a>
                </Link>
              </>
            )}
          </div>
        ),
      },
      {
        title: t('common:delete'),
        dataIndex: 'action',
        align: 'center' as AlignType,
        width: 30,
        className: 'drag-visible thead-title',
        render: (_, department: Department) => (
          <Button className="action-button remove-button" disabled={disabled}>
            <TrashIcon
              onClick={() =>
                setModalDeleteDepartment({
                  visible: true,
                  onOk: () =>
                    dispatchDeleteDepartment({
                      params: { id: department.id },
                      callback: () => {
                        dispatchGetDepartments();
                        setIsDeleteSuccessVisible(true);
                        setModalDeleteDepartmentName(department.name);
                      },
                      finalCallback: () => setModalDeleteDepartment(null),
                    }),
                  department,
                  onCancel: () => {
                    setModalDeleteDepartment(null);
                  },
                })
              }
            />
          </Button>
        ),
      },
    ],
    [t, disabled, dispatchDeleteDepartment, dispatchGetDepartments]
  );

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable([].concat(departments), oldIndex, newIndex).filter(el => !!el);

      setDepartments(newData);

      dispatchBulkUpdateDepartments({
        params: {
          departments: newData.map((department, index) => ({
            id: department.id,
            orderNo: departments[index].orderNo,
          })),
        },
        callback: () => dispatchGetDepartments(),
      });
    }
  };

  const draggableContainer = props => (
    <SortableBody useDragHandle disableAutoscroll helperClass="row-dragging" onSortEnd={onSortEnd} {...props} />
  );

  const draggableBodyRow = ({ ...restProps }) => {
    const index = departments?.findIndex(x => x.index === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  useEffect(() => {
    setDepartments(dataSource?.map((item, index) => ({ ...item, index })));
  }, [dataSource]);

  return (
    <>
      <Table
        pagination={false}
        dataSource={departments}
        columns={columns}
        rowKey="index"
        loading={loading}
        components={{
          body: {
            wrapper: draggableContainer,
            row: draggableBodyRow,
          },
        }}
        className="department-table"
      />
      <Modal title={t('modal_delete_department_title')} {...modalDeleteDepartment} footer={false} centered>
        <div className="text-pre-line">
          {t('modal_delete_department_message', { department_name: modalDeleteDepartment?.department?.name })}
        </div>
        <Space align="center" direction="vertical" className="w-100">
          <Button
            shape="round"
            size="large"
            type="primary"
            className="mn-w150p"
            loading={isDeleteLoading}
            onClick={modalDeleteDepartment?.onOk}
          >
            {t('common:delete')}
          </Button>
        </Space>
      </Modal>

      {/* Modal delete success */}
      <ModalInfo
        okText={t('common:button_close')}
        onOk={() => setIsDeleteSuccessVisible(false)}
        visible={isDeleteSuccessVisible}
        title={t('modal_delete_department_title')}
        closable={false}
      >
        <p className="mb-0">{t('modal_delete__status_success')}</p>
        <p className="mb-0">{t('modal_delete_deleted_department', { name: modalDeleteDepartmentName })}</p>
      </ModalInfo>
    </>
  );
};

export default DepartmentTable;
