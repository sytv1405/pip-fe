import { Button, Card, Col, ModalProps, Row, Typography, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { isEmpty } from 'lodash';
import { Trans } from 'react-i18next';

import { Payload } from '@/types';
import { Spacer } from '@/components/Spacer';
import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  bulkUpdateDepartments,
  bulkInsertDepartments,
} from '@/redux/actions/departmentActions';
import { convertXlsxToJson, downloadFile, exportToXlsx, formatDownloadFileName, formatXlsxJsonData } from '@/utils/fileUtils';
import { DEPARTMENT_XLSX_OPTIONS } from '@/shared/file';
import { convertFullWidthNumberToHalfWidth } from '@/utils/convertUtils';
import LoadingScreen from '@/components/LoadingScreen';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { ModalInfo } from '@/components/modal';
import { CopyIcon, ExportIcon, ExternalIcon, FilePlusIcon, ListIcon, ExcelIcon, EllipseIcon } from '@/assets/images';
import { SectionTitle } from '@/components/Typography';

import DepartmentTable from './modules/DepartmentTable';
import DepartmentForm from './modules/DepartmentForm';

type UploadError = {
  errorCode: string;
  rows: number[];
};

const DepartmentPage = ({
  departments,
  isLoading,
  isCreateLoading,
  isDeleteLoading,
  isBulkInsertLoading,
  dispatchGetDepartments,
  dispatchCreateDepartment,
  dispatchDeleteDepartment,
  dispatchBulkUpdateDepartments,
  dispatchBulkInsertDepartments,
}: PropsFromRedux) => {
  const isOrganizationDeleted = useIsOrganizationDeleted();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [t] = useTranslation(['department_master', 'common']);
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>(null);
  const [isModalErrorVisible, setModalErrorVisible] = useState(false);
  const [isOpenNewDepartment, setOpenNewDepartment] = useState(false);
  const [modalUploadSuccess, setModalUploadSuccess] = useState<
    ModalProps & {
      affectedRows: number;
    }
  >(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleUpload = async ({ file }) => {
    const jsonData = await convertXlsxToJson(file);

    if (isEmpty(jsonData)) {
      setUploadErrors(null);
      setModalErrorVisible(true);
      return;
    }

    const formattedJsonData = formatXlsxJsonData(jsonData, {
      columnNames: DEPARTMENT_XLSX_OPTIONS.columnNames,
      transformData: (value, key) => {
        if (key === 'id' && value) return convertFullWidthNumberToHalfWidth(value);
        return value;
      },
    });

    dispatchBulkInsertDepartments({
      params: {
        departments: formattedJsonData,
      },
      callback: data => {
        if (data?.affectedRows) {
          setUploadErrors(null);
          setModalUploadSuccess({
            visible: true,
            affectedRows: data?.affectedRows,
            onOk: () => setModalUploadSuccess(null),
            onCancel: () => setModalUploadSuccess(null),
          });
          dispatchGetDepartments();
        } else {
          setUploadErrors(data);
        }
      },
    });
  };

  const handleDownloadTemplate = () => {
    downloadFile({
      href: '/static/xlsx/部署.xlsx',
      fileName: formatDownloadFileName(DEPARTMENT_XLSX_OPTIONS.fileName, { ext: 'xlsx' }),
    });
  };

  const handleDownloadXlsx = () => {
    const { columnNames, columnWidths, fileName } = DEPARTMENT_XLSX_OPTIONS;

    exportToXlsx({
      data: [[columnNames.id, columnNames.name], ...departments.map(department => [department.id, department.name])],
      fileName: formatDownloadFileName(fileName, { ext: 'xlsx' }),
      columnWidths,
    });
  };

  useEffect(() => {
    dispatchGetDepartments();
  }, [dispatchGetDepartments]);

  return (
    <WithAuth title={t('common:page_department')} isContentFullWidth>
      {isBulkInsertLoading && <LoadingScreen />}
      <div className="department-container">
        <Row>
          <Col sm={12}>
            <SectionTitle icon={<CopyIcon />}>{t('title_import_file')}</SectionTitle>
          </Col>
          <Col sm={12}>
            <div className="section-action">
              <Button className="action-button" shape="round" disabled={isOrganizationDeleted} onClick={() => setOpenNewDepartment(true)}>
                {t('create_department')}
                <ExternalIcon className="ml-2" />
              </Button>
            </div>
          </Col>
        </Row>
        <Card className="card-body">
          <section className="section-content section-upload pb-0">
            <Upload.Dragger
              name="file"
              showUploadList={false}
              multiple={false}
              accept=".xlsx"
              customRequest={handleUpload}
              disabled={isOrganizationDeleted}
            >
              <FilePlusIcon />
              <Trans
                i18nKey="common:drag_drop_attachment"
                t={t}
                components={{
                  title: <p className="ant-upload-title" />,
                  subtitle: <p className="ant-upload-subtitle" />,
                }}
              />
            </Upload.Dragger>
            <Typography.Paragraph className="upload-description p-3">
              <p className="desc mb-0">
                {t('import_file_description')}
                <Button className="ml-2" shape="round" onClick={showModal}>
                  {t('button_import_file_detail')}
                  <ExternalIcon className="ml-2" />
                </Button>
              </p>
            </Typography.Paragraph>
            {!!uploadErrors &&
              uploadErrors?.map?.(error => (
                <Typography.Paragraph key={error?.errorCode}>
                  <Typography.Text type="danger" className="text-pre-line">
                    {t(`server_error:${error?.errorCode}`, { lines: error?.rows.map(row => `${row + 1}${t('common:line')}`).join('、') })}
                  </Typography.Text>
                </Typography.Paragraph>
              ))}
            <Typography.Paragraph>
              <div className="flex-center group-link mt-4">
                <Button type="link" className="link-underline export-action" onClick={handleDownloadTemplate}>
                  <ExportIcon className="export-action__icon" />
                  <span className="export-action__text">{t('button_download_template')}</span>
                  <ExcelIcon className="export-action__icon" />
                </Button>
                <Button type="link" className="link-underline export-action ml-5" onClick={handleDownloadXlsx}>
                  <ExportIcon className="export-action__icon" />
                  <span className="export-action__text">{t('button_download_department')}</span>
                  <ExcelIcon className="export-action__icon" />
                </Button>
              </div>
            </Typography.Paragraph>
          </section>
        </Card>
        <Spacer height="40px" />
        <SectionTitle icon={<ListIcon />}>
          {t('title_department_list')}
          <span className="subtitle ml-2">{t('common:record_count', { total: departments?.length })}</span>
        </SectionTitle>
        <Card className="card-body">
          <section className="section-content mb-4">
            <div className="table-content">
              <DepartmentTable
                disabled={isOrganizationDeleted}
                dataSource={departments}
                loading={isLoading}
                isDeleteLoading={isDeleteLoading}
                dispatchDeleteDepartment={dispatchDeleteDepartment}
                dispatchGetDepartments={dispatchGetDepartments}
                dispatchBulkUpdateDepartments={dispatchBulkUpdateDepartments}
              />
            </div>
          </section>
        </Card>
        <ModalInfo
          className="modal-pd-30 modal-footer-center"
          title={t('prevent_excel_title')}
          onCancel={handleCancel}
          visible={isModalVisible}
          width="900px"
          okText={t('common:button_close')}
          closable={true}
          footer={null}
        >
          <Typography.Title level={5} className="mt-px-10 mb-px-5">
            {t('register_new')}
          </Typography.Title>
          <Typography.Paragraph className="mb-0">
            <p className="mb-0 excel-modal-line">
              <EllipseIcon className="mr-2" />
              {t('register_new_sub_1')}
            </p>
          </Typography.Paragraph>
          <Typography.Title level={5} className="mt-px-15 mb-px-5">
            {t('update_department')}
          </Typography.Title>
          <Typography.Paragraph className="mb-0">
            <p className="mb-0 color-text excel-modal-line">
              <EllipseIcon className="mr-2" />
              {t('update_department_sub_1')}
            </p>
            <p className="mb-0 excel-modal-line">
              <EllipseIcon className="mr-2" />
              {t('update_department_sub_2')}
            </p>
            <p className="mb-0 excel-modal-line">
              <EllipseIcon className="mr-2" />
              {t('update_department_sub_3')}
            </p>
          </Typography.Paragraph>
          <Typography.Title level={5} className="mt-px-15 mb-px-5">
            {t('delete_department')}
          </Typography.Title>
          <Typography.Paragraph className="mb-0">
            <p className="mb-0 excel-modal-line">
              <EllipseIcon className="mr-2" />
              {t('delete_department_sub1')}
            </p>
          </Typography.Paragraph>
          <Spacer height="20px" />
          <div className="flex-center">
            <Button type="primary" onClick={handleOk} className="mn-w180p font-weight-bold" size="large">
              {t('common:button_close')}
            </Button>
          </div>
        </ModalInfo>
        <ModalInfo
          title={t('modal_import_department_error_title')}
          visible={isModalErrorVisible}
          onOk={() => setModalErrorVisible(false)}
          onCancel={() => setModalErrorVisible(false)}
          closable={false}
          okText={t('common:button_close')}
        >
          <div className="text-pre-line">{t('common:message_excel_no_data')}</div>
        </ModalInfo>
        <ModalInfo {...modalUploadSuccess} title={t('modal_import_department_success_title')} okText={t('common:button_close')}>
          <Typography.Paragraph className="text-pre-line">
            {t('modal_import_department_success_message', { import_count: modalUploadSuccess?.affectedRows })}
          </Typography.Paragraph>
        </ModalInfo>
        <DepartmentForm
          visible={isOpenNewDepartment}
          isCreateLoading={isCreateLoading}
          dispatchCreateDepartment={dispatchCreateDepartment}
          onCancel={() => setOpenNewDepartment(false)}
          onSucess={() => {
            dispatchGetDepartments();
            setOpenNewDepartment(false);
          }}
        />
      </div>
    </WithAuth>
  );
};

const mapStateToProps = state => {
  const { departments, isLoading, isCreateLoading, isDeleteLoading, isBulkInsertLoading } = state.departmentReducer;
  return { departments, isLoading, isCreateLoading, isDeleteLoading, isBulkInsertLoading };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetDepartments: () => dispatch(getDepartments()),
  dispatchCreateDepartment: (payload: Payload) => dispatch(createDepartment(payload)),
  dispatchDeleteDepartment: (payload: Payload) => dispatch(deleteDepartment(payload)),
  dispatchBulkUpdateDepartments: (payload: Payload) => dispatch(bulkUpdateDepartments(payload)),
  dispatchBulkInsertDepartments: (payload: Payload) => dispatch(bulkInsertDepartments(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(DepartmentPage);
