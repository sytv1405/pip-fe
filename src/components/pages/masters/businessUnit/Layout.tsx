import React, { FC, useEffect, useState, useCallback } from 'react';
import { Button, Card, Checkbox, Col, Row, Typography, Upload } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { startsWith, isEmpty } from 'lodash';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { BusinessUnitLevel } from '@/shared/enum';
import { CreateBusinessSuccessModal } from '@/components/pages/masters/businessUnit/modal/createBusinessSuccess';
import { UploadExcelNoteModal } from '@/components/pages/masters/businessUnit/modal/uploadExcelNote';
import { Trans, useTranslation } from 'i18next-config';
import { RootState } from '@/redux/rootReducer';
import { getDepartments } from '@/redux/actions';
import {
  bulkInsertBusinessUnit,
  createLargeBusinessUnit,
  createMediumBusinessUnit,
  createSmallBusinessUnit,
  downloadBusinesUnit,
  searchBusinessUnit,
} from '@/redux/actions/businessUnitActions';
import { MajorCategory, MiddleCategory, MinorCategory, Payload } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import { BusinessUnitMasterList } from '@/components/pages/masters/businessUnit/list';
import { convertXlsxToJson, downloadFile, formatDownloadFileName, formatXlsxJsonData, exportToXlsx } from '@/utils/fileUtils';
import { BUSINESS_UNIT_XLSX_OPTIONS } from '@/shared/file';
import { FILENAME_REGEX } from '@/shared/regex';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import useIsOrganizationDeleted from '@/hooks/useOrganizationWasDeleted';
import { BulkInsertBusinessEmptyErrorModal } from '@/components/pages/masters/businessUnit/modal/bulkInsertBusinessEmptyError';
import { convertFullWidthNumberToHalfWidth } from '@/utils/convertUtils';
import { CreateBusinessErrorModal } from '@/components/pages/masters/businessUnit/modal/createBusinessError';
import { SectionTitle } from '@/components/Typography';
import { Spacer } from '@/components/Spacer';
import { CopyIcon, ExcelIcon, ExportIcon, ExternalIcon, FilePenIcon, FilePlusIcon } from '@/assets/images';
import { ModalInfo } from '@/components/modal';

import { UploadBusinessErrorModal } from './modal/uploadBusinessError';
import { CreateBusinessModal } from './modal/createBusiness';
import styles from './styles.module.scss';
import { CreateBulkBusinessSuccessModal } from './modal/createBulkBusinessSuccess';

interface CreateBusinessUnit {
  departmentId: number;
  majorCategoryId: number;
  middleCategoryId: number;
  name: string;
  businessLevel: BusinessUnitLevel;
}

const Layout: FC<PropsFromRedux> = ({
  isLoading,
  businessUnitQueryParam,
  dispatchSearchBusinessUnit,
  dispatchGetDepartments,
  dispatchCreateLargeBusiness,
  dispatchCreateMediumBusiness,
  dispatchCreateSmallBusiness,
  dispatchDownloadBusinesUnit,
  dispatchBulkInsertBusinessUnit,
}: PropsFromRedux) => {
  const [showCreateBulkBusinessSuccessModal, setShowCreateBulkBusinessSuccessModal] = useState<boolean>(false);
  const [showCreateBusinessSuccessModal, setShowCreateBusinessSuccessModal] = useState<boolean>(false);
  const [showUploadExcelNoteModal, setShowUploadExcelNoteModal] = useState<boolean>(false);
  const [showBusinessDuplicateModal, setShowBusinessDuplicateModal] = useState<boolean>(false);
  const [showDepartmentDeletedModal, setShowDepartmentDeletedModal] = useState<boolean>(false);
  const [showCreateBusinessModal, setShowCreateBusinessModal] = useState<boolean>(false);
  const [uploadErrors, setErrors] = useState<any>({});
  const [importDataLength, setImportDataLength] = useState<number>(0);
  const [isShowUploadBusinessError, setShowUploadBusinessError] = useState<boolean>(false);
  const [isShowUploadEmptyBusinessError, setShowUploadEmptyBusinessError] = useState<boolean>(false);
  const [uploadedFileCount, setUploadedFileCount] = useState<number>(0);
  const [createBusinessInfo, setCreateBusinessInfo] = useState<CreateBusinessUnit>({} as CreateBusinessUnit);
  const isOrganizationDeleted = useIsOrganizationDeleted();

  const [t] = useTranslation(['business_unit', 'server_error']);
  const [isModalNoBusinessUnitWarningVisible, setModalNoBusinessUnitWarningVisible] = useState<boolean>(false);

  const { control, watch } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .nullable()
          .required(t('common:message_required', { field: t('business_unit_name') }))
          .max(50, t('common:message_max_length', { max: 50 })),
      })
    ),
    defaultValues: {
      businessLevel: BusinessUnitLevel.large,
      downloadBusinessLevel: [],
      name: null,
    },
  });

  const selectedDownloadBusinessLevel = watch('downloadBusinessLevel');

  const onCloseCreateBulkBusinessSuccessModal = (): void => {
    setShowCreateBulkBusinessSuccessModal(false);
  };

  const onCloseCreateBusinessSuccessModal = (): void => {
    dispatchSearchBusinessUnit({ params: businessUnitQueryParam });
    setCreateBusinessInfo({} as CreateBusinessUnit);
    setShowCreateBusinessSuccessModal(false);
  };

  const onCloseCreateBusinessModal = (): void => {
    setShowCreateBusinessModal(false);
  };

  const onUploadBusinessUnit = async ({ file }) => {
    if (isOrganizationDeleted) return;
    if (uploadedFileCount > 1) {
      setShowUploadBusinessError(true);
      return;
    }
    if (!file) {
      return;
    }
    setErrors({});
    const { groups: { filename } = {} } = FILENAME_REGEX.exec(file.name);
    const { large, small, medium } = BUSINESS_UNIT_XLSX_OPTIONS;
    let businessType;
    let columnNames = {};
    let dataKey;
    switch (true) {
      case startsWith(filename, large.fileName):
        businessType = BusinessUnitLevel.large;
        columnNames = large.columnNames;
        dataKey = 'majorCategories';
        break;
      case startsWith(filename, medium.fileName):
        businessType = BusinessUnitLevel.medium;
        columnNames = medium.columnNames;
        dataKey = 'middleCategories';
        break;
      case startsWith(filename, small.fileName):
        businessType = BusinessUnitLevel.small;
        columnNames = small.columnNames;
        dataKey = 'minorCategories';
        break;
      default:
        setErrors({ filename: t('invalid_filename') });
        break;
    }

    if (!businessType) {
      return;
    }
    const jsonData = await convertXlsxToJson(file);

    if (isEmpty(jsonData)) {
      setShowUploadEmptyBusinessError(true);
      return;
    }

    const formattedJsonData = formatXlsxJsonData(jsonData, {
      columnNames,
      transformData: (value, key) => {
        if (['id', 'departmentId', 'majorCategoryId', 'middleCategoryId'].includes(key) && value) {
          return convertFullWidthNumberToHalfWidth(value);
        }
        return value;
      },
    });

    dispatchBulkInsertBusinessUnit({
      params: { businessType, [dataKey]: formattedJsonData },
      callback: () => {
        setImportDataLength(formattedJsonData.length);
        setShowCreateBulkBusinessSuccessModal(true);
      },
      errorCallback: serverErrors => {
        if (serverErrors?.data?.length) {
          setErrors(prev => ({ ...prev, errorDetails: serverErrors?.data }));
        }
      },
    });
  };

  const openUploadExcelNoteModal = (): void => {
    setShowUploadExcelNoteModal(true);
  };

  const closeUploadExcelNoteModal = (): void => {
    setShowUploadExcelNoteModal(false);
  };

  const createBusinessUnit = setFieldError => (data: CreateBusinessUnit) => {
    if (isOrganizationDeleted) return;
    const { businessLevel, departmentId, majorCategoryId, middleCategoryId, name } = data;
    switch (businessLevel) {
      case BusinessUnitLevel.large:
        dispatchCreateLargeBusiness({
          params: {
            departmentId,
            name,
          },
          callback: () => {
            setCreateBusinessInfo(data);
            setShowCreateBusinessModal(false);
            setShowCreateBusinessSuccessModal(true);
          },
          errorCallback: error => {
            if (error?.errorCode === ErrorCodes.DUPLICATE_CATEGORY) {
              setFieldError('name', { message: t('business_name_duplicate') });
            }
            if (error?.data?.errorCode === ErrorCodes.CATEGORY_DEPARTMENT_DELETED) {
              setShowDepartmentDeletedModal(true);
            }
          },
        });
        break;
      case BusinessUnitLevel.medium:
        dispatchCreateMediumBusiness({
          params: {
            majorCategoryId,
            name,
          },
          callback: () => {
            setCreateBusinessInfo(data);
            setShowCreateBusinessModal(false);
            setShowCreateBusinessSuccessModal(true);
          },
          errorCallback: error => {
            if (error?.errorCode === ErrorCodes.DUPLICATE_CATEGORY) {
              setFieldError('name', { message: t('business_name_duplicate') });
            }
          },
        });
        break;
      default:
        dispatchCreateSmallBusiness({
          params: {
            middleCategoryId,
            name,
          },
          callback: () => {
            setCreateBusinessInfo(data);
            setShowCreateBusinessModal(false);
            setShowCreateBusinessSuccessModal(true);
          },
          errorCallback: error => {
            if (error?.errorCode === ErrorCodes.DUPLICATE_CATEGORY) {
              setFieldError('name', { message: t('business_name_duplicate') });
            }
          },
        });
    }
  };

  const getBusinessLevel = useCallback(() => {
    switch (createBusinessInfo.businessLevel) {
      case BusinessUnitLevel.large:
        return t('common:large');
      case BusinessUnitLevel.medium:
        return t('common:medium');
      default:
        return t('common:small');
    }
  }, [t, createBusinessInfo]);

  const downloadTemplateHandler = useCallback(() => {
    if (!selectedDownloadBusinessLevel.length) {
      setModalNoBusinessUnitWarningVisible(true);
    } else {
      selectedDownloadBusinessLevel.forEach(level => {
        switch (level) {
          case BusinessUnitLevel.large:
            downloadFile({
              href: '/static/xlsx/業務ユニット（大）.xlsx',
              fileName: formatDownloadFileName(BUSINESS_UNIT_XLSX_OPTIONS.large.fileName, { ext: 'xlsx' }),
            });
            break;
          case BusinessUnitLevel.medium:
            downloadFile({
              href: '/static/xlsx/業務ユニット（中）.xlsx',
              fileName: formatDownloadFileName(BUSINESS_UNIT_XLSX_OPTIONS.medium.fileName, { ext: 'xlsx' }),
            });
            break;
          case BusinessUnitLevel.small:
            downloadFile({
              href: '/static/xlsx/業務ユニット（小）.xlsx',
              fileName: formatDownloadFileName(BUSINESS_UNIT_XLSX_OPTIONS.small.fileName, { ext: 'xlsx' }),
            });
            break;

          default:
            break;
        }
      });
    }
  }, [selectedDownloadBusinessLevel]);

  const downloadBusinessUnitHandler = useCallback(() => {
    if (!selectedDownloadBusinessLevel.length) {
      setModalNoBusinessUnitWarningVisible(true);
    } else {
      dispatchDownloadBusinesUnit({
        callback: (businessUnit: {
          majorCategories: MajorCategory[];
          middleCategories: MiddleCategory[];
          minorCategories: MinorCategory[];
        }) => {
          const { majorCategories, middleCategories, minorCategories } = businessUnit;
          const {
            large: { columnNames: majorColumns, fileName: majorFileName, columnWidths: majorColumnWidths },
            medium: { columnNames: mediumColumns, fileName: mediumFileName, columnWidths: mediumColumnWidths },
            small: { columnNames: smallColumns, fileName: smallFileName, columnWidths: smallColumnWidths },
          } = BUSINESS_UNIT_XLSX_OPTIONS;

          selectedDownloadBusinessLevel.forEach(level => {
            switch (level) {
              case BusinessUnitLevel.large:
                exportToXlsx({
                  data: [
                    [majorColumns.departmentId, majorColumns.id, majorColumns.name],
                    ...majorCategories.map(major => [major.departmentId, major.id, major.name]),
                  ],
                  fileName: formatDownloadFileName(majorFileName, { ext: 'xlsx' }),
                  columnWidths: majorColumnWidths,
                });
                break;
              case BusinessUnitLevel.medium:
                exportToXlsx({
                  data: [
                    [mediumColumns.majorCategoryId, mediumColumns.id, mediumColumns.name],
                    ...middleCategories.map(middle => [middle.majorCategoryId, middle.id, middle.name]),
                  ],
                  fileName: formatDownloadFileName(mediumFileName, { ext: 'xlsx' }),
                  columnWidths: mediumColumnWidths,
                });
                break;
              case BusinessUnitLevel.small:
                exportToXlsx({
                  data: [
                    [smallColumns.middleCategoryId, smallColumns.id, smallColumns.name],
                    ...minorCategories.map(minor => [minor.middleCategoryId, minor.id, minor.name]),
                  ],
                  fileName: formatDownloadFileName(smallFileName, { ext: 'xlsx' }),
                  columnWidths: smallColumnWidths,
                });
                break;

              default:
                break;
            }
          });
        },
      });
    }
  }, [dispatchDownloadBusinesUnit, selectedDownloadBusinessLevel]);

  useEffect(() => {
    dispatchGetDepartments();
  }, [dispatchGetDepartments]);

  return (
    <WithAuth title={t('buniness_unit_title')} isContentFullWidth>
      {isLoading && <LoadingScreen />}
      {/* Create Business Unit by xlsx */}
      <Row justify="space-between" align="top">
        <Col sm={12}>
          <SectionTitle icon={<CopyIcon />}>{t('creat_general_business')}</SectionTitle>
        </Col>
        <Col sm={12}>
          <div className="d-flex justify-content-end mt-3">
            <Button
              className="action-button"
              shape="round"
              disabled={isOrganizationDeleted}
              onClick={() => setShowCreateBusinessModal(true)}
            >
              {t('common:btn_create_one_by_one')}
              <ExternalIcon className="ml-2" />
            </Button>
          </div>
        </Col>
      </Row>
      <Card bordered={false}>
        <Upload.Dragger
          name="file"
          showUploadList={false}
          multiple
          accept=".xlsx"
          onChange={({ fileList }) => setUploadedFileCount(fileList?.length || 0)}
          fileList={[]}
          customRequest={onUploadBusinessUnit}
          disabled={isOrganizationDeleted}
        >
          <FilePlusIcon />
          <Trans
            i18nKey="common:drag_drop_attachment_one_by_one"
            t={t}
            components={{
              title: <p className="ant-upload-title" />,
              subtitle: <p className="ant-upload-subtitle" />,
            }}
          />
        </Upload.Dragger>
        <div className={classNames(styles['gray-zone'], 'mt-3 p-3')}>
          <Typography.Paragraph className="mb-0">
            {t('business_unit__upload_desc_1')}
            <br />
            {t('upload_desc_2')}
          </Typography.Paragraph>
          <Button className={classNames(styles['button-details'], 'mt-3 mx-auto')} shape="round" onClick={openUploadExcelNoteModal}>
            {t('upload_desc_3')}
            <ExternalIcon className="ml-2" />
          </Button>
          {uploadErrors?.filename && <Typography.Text type="danger">{uploadErrors?.filename}</Typography.Text>}
          {!!uploadErrors?.errorDetails?.length &&
            uploadErrors?.errorDetails?.map(error => (
              <Typography.Paragraph key={error?.errorCode}>
                <Typography.Text type="danger" className="text-pre-line">
                  {t(`server_error:${error?.errorCode}`, {
                    lines: error?.rows
                      ?.map(row =>
                        row instanceof Array
                          ? row.map(r => `${r + 1}${t('common:line')}`).join(t('common:and'))
                          : `${row + 1}${t('common:line')}`
                      )
                      .join('、'),
                  })}
                </Typography.Text>
              </Typography.Paragraph>
            ))}
        </div>
        <Spacer height="20px" />
        <div className="text-center my-2">
          <Typography.Text strong>{t('common:select_unit_level_multiple')}</Typography.Text>
        </div>
        <Typography.Paragraph className={classNames(styles['download-section'], 'mx-auto p-3')}>
          <section className={classNames(styles['radio-download-section'], 'flex-center pb-3 mb-3')}>
            <Controller
              control={control}
              name="downloadBusinessLevel"
              render={({ field: { onChange } }) => (
                <Checkbox.Group onChange={onChange}>
                  <Checkbox className="text-minimum" value={BusinessUnitLevel.large}>
                    {t('business_unit_lg')}
                  </Checkbox>
                  <Checkbox className="text-minimum" value={BusinessUnitLevel.medium}>
                    {t('business_unit_md')}
                  </Checkbox>
                  <Checkbox className="text-minimum" value={BusinessUnitLevel.small}>
                    {t('business_unit_sm')}
                  </Checkbox>
                </Checkbox.Group>
              )}
            />
          </section>
          <section className="flex-center">
            <div className="d-flex justify-content-between flex-wrap">
              <Button type="link" className={classNames(styles['export-action'], 'link-underline mx-3')} onClick={downloadTemplateHandler}>
                <ExportIcon className={styles['export-action__icon']} />
                <span className={styles['export-action__text']}>{t('button_download_excel_template')}</span>
                <ExcelIcon className={styles['export-action__icon']} />
              </Button>
              <Button
                type="link"
                className={classNames(styles['export-action'], 'link-underline mx-3')}
                onClick={downloadBusinessUnitHandler}
              >
                <ExportIcon className={styles['export-action__icon']} />
                <span className={styles['export-action__text']}>{t('download_registered_department')}</span>
                <ExcelIcon className={styles['export-action__icon']} />
              </Button>
            </div>
          </section>
        </Typography.Paragraph>
      </Card>
      <Spacer height="40px" />
      <SectionTitle icon={<FilePenIcon />}>{t('title_business_unit_edit')}</SectionTitle>
      <BusinessUnitMasterList />
      {/* Modal */}
      <CreateBulkBusinessSuccessModal
        numberOfBusiness={importDataLength}
        isVisible={showCreateBulkBusinessSuccessModal}
        onOk={onCloseCreateBulkBusinessSuccessModal}
      />
      <UploadBusinessErrorModal isVisible={isShowUploadBusinessError} onOk={() => setShowUploadBusinessError(false)} />
      <CreateBusinessSuccessModal
        isVisible={showCreateBusinessSuccessModal}
        onOk={onCloseCreateBusinessSuccessModal}
        businessName={createBusinessInfo.name}
        businessLevel={getBusinessLevel()}
      />
      <UploadExcelNoteModal isVisible={showUploadExcelNoteModal} onOk={closeUploadExcelNoteModal} />
      <CreateBusinessErrorModal
        message={t('business_name_duplicate')}
        isVisible={showBusinessDuplicateModal}
        onOk={() => setShowBusinessDuplicateModal(false)}
      />
      <CreateBusinessErrorModal
        message={t('create_unit__department_deleted')}
        isVisible={showDepartmentDeletedModal}
        onOk={() => setShowDepartmentDeletedModal(false)}
      />
      {showCreateBusinessModal && (
        <CreateBusinessModal
          isOrganizationDeleted={isOrganizationDeleted}
          isVisible={showCreateBusinessModal}
          onOk={onCloseCreateBusinessModal}
          createBusinessUnit={createBusinessUnit}
        />
      )}
      <BulkInsertBusinessEmptyErrorModal isVisible={isShowUploadEmptyBusinessError} onOk={() => setShowUploadEmptyBusinessError(false)} />
      <ModalInfo
        title={t('common:title_modal_download_when_no_option')}
        visible={isModalNoBusinessUnitWarningVisible}
        onOk={() => setModalNoBusinessUnitWarningVisible(false)}
        onCancel={() => setModalNoBusinessUnitWarningVisible(false)}
        okText={t('common:button_close')}
      >
        <div className="text-pre-line text-center">{t('server_error:SSC-120-002')}</div>
      </ModalInfo>
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const { isLoading: departmentLoading } = state.departmentReducer;
  const { isLoading: businessUnitLoading, isDownloading, isUploading, businessUnitQueryParam } = state.businessUnitReducer;
  return {
    businessUnitQueryParam,
    isLoading: departmentLoading || businessUnitLoading || isUploading || isDownloading,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetDepartments: () => dispatch(getDepartments()),
  dispatchCreateLargeBusiness: (payload: Payload) => dispatch(createLargeBusinessUnit(payload)),
  dispatchCreateMediumBusiness: (payload: Payload) => dispatch(createMediumBusinessUnit(payload)),
  dispatchCreateSmallBusiness: (payload: Payload) => dispatch(createSmallBusinessUnit(payload)),
  dispatchDownloadBusinesUnit: (payload: Payload) => dispatch(downloadBusinesUnit(payload)),
  dispatchBulkInsertBusinessUnit: (payload: Payload) => dispatch(bulkInsertBusinessUnit(payload)),
  dispatchSearchBusinessUnit: (payload: Payload) => dispatch(searchBusinessUnit(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
