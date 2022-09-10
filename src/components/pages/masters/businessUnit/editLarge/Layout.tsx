import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Typography, Row, Col } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormItem from 'antd/lib/form/FormItem';
import classNames from 'classnames';

import { WithAuth } from '@/components/Roots/WithAuth';
import { useTranslation } from 'i18next-config';
import { FormError } from '@/components/form';
import { RootState } from '@/redux/rootReducer';
import { Payload } from '@/types';
import {
  deleteLargeBusinessUnit,
  getLargeBusinessUnitDetails,
  updateLargeBusinessUnit,
  cleanLargeBusinessUnitDetails,
} from '@/redux/actions/businessUnitActions';
import { getDepartments } from '@/redux/actions';
import LoadingScreen from '@/components/LoadingScreen';
import { paths } from '@/shared/paths';
import { UpdateBusinessSuccessModal } from '@/components/pages/masters/businessUnit/modal/updateBusinessSuccess';
import { DeleteBusinessConfirmModal } from '@/components/pages/masters/businessUnit/modal/DeleteBusinessConfirm';
import { GetBusinessDetailNotFound } from '@/components/pages/masters/businessUnit/modal/getBusinessDetailNotFound';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { CreateBusinessErrorModal } from '@/components/pages/masters/businessUnit/modal/createBusinessError';
import { ArrowLeftIcon, EllipseIcon, FileCheckIcon, FilePenIcon } from '@/assets/images';
import { SectionTitle } from '@/components/Typography';
import { Spacer } from '@/components/Spacer';

import { DeleteBusinessSucessModal } from '../modal/DeleteBusinessSucess';
import BusinessFormSelect from '../BusinessFormSelect';
import BusinessTitleChange from '../BusinessTitleChange';
import styles from '../styles.module.scss';

interface UpdateLargeBusinessUnit {
  departmentId: number;
  name: string;
}

// FIXME: use typescript instead of any
const Layout = ({
  largeBusinessUnitDetails,
  departmentsLoading,
  businessUnitLoading,
  isUpdateLoading,
  isDeleteLoading,
  dispatchGetDepartments,
  dispatchUpdateLargeBusiness,
  dispatchGetLargeBusinessDetails,
  dispatchDeleteLargeBusinessUnit,
  dispatchCleanLargeBusinessDetails,
}: PropsFromRedux) => {
  const [t] = useTranslation(['business_unit', 'task']);
  const formProps = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup
          .string()
          .nullable()
          .max(50, t('common:message_max_length', { max: 50 })),
        departmentId: yup
          .number()
          .nullable()
          .required(t('common:please_select', { field: t('department') })),
      })
    ),
  });
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    setError,
  } = formProps;
  const selectedName = watch('name');
  const selectedDepartmentId = watch('departmentId');

  const router = useRouter();
  const { id: largeUnitId } = router.query;

  const [isModalUpdateSuccesslVisible, setIsModalUpdateSuccesslVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalDeleteSucessVisible, setIsModalDeleteSucessVisible] = useState(false);
  const [isModalDetailNotFoundVisible, setIsModalDetailNotFoundVisible] = useState(false);
  const [showDepartmentDeletedModal, setShowDepartmentDeletedModal] = useState<boolean>(false);

  const updateLargeBusiness = ({ name, departmentId }: UpdateLargeBusinessUnit) => {
    dispatchUpdateLargeBusiness({
      params: {
        ...(departmentId && { departmentId }),
        ...(name && { name }),
        id: (largeBusinessUnitDetails as any).id,
      },
      callback: () => {
        setIsModalUpdateSuccesslVisible(true);
      },
      errorCallback: error => {
        if (error?.errorCode === ErrorCodes.DUPLICATE_CATEGORY) {
          setError('name', { message: t('business_name_duplicate') });
        }
        if (error?.data?.errorCode === ErrorCodes.CATEGORY_DEPARTMENT_DELETED) {
          setShowDepartmentDeletedModal(true);
        }
      },
    });
  };

  const deleteLargeBusiness = () => {
    dispatchDeleteLargeBusinessUnit({
      params: {
        id: largeUnitId,
      },
      callback: () => {
        setIsModalDeleteVisible(false);
        setIsModalDeleteSucessVisible(true);
      },
    });
  };

  useEffect(() => {
    dispatchGetDepartments();
    dispatchGetLargeBusinessDetails({
      params: largeUnitId,
      errorCallback: error => {
        if (error?.data?.errorCode === ErrorCodes.NOT_FOUND) {
          setIsModalDetailNotFoundVisible(true);
        }
      },
    });
  }, [dispatchGetDepartments, dispatchGetLargeBusinessDetails, largeUnitId]);

  useEffect(() => {
    return () => {
      dispatchCleanLargeBusinessDetails();
    };
  }, [dispatchCleanLargeBusinessDetails]);

  useEffect(() => {
    setValue('name', largeBusinessUnitDetails?.name);
  }, [largeBusinessUnitDetails?.name, setValue]);

  return (
    <WithAuth title={t('buniness_unit_title')} isContentFullWidth>
      {(departmentsLoading || businessUnitLoading) && <LoadingScreen />}
      <Typography.Paragraph>
        <Link href={`${paths.master.businessUnit.index}`}>
          <a>
            <ArrowLeftIcon />
            <span className={classNames(styles['back-link'], 'ml-2 text-minimum')}>{t('return_to_business_master')}</span>
          </a>
        </Link>
      </Typography.Paragraph>
      <Row className="edit-business-unit" gutter={32}>
        <Col md={12}>
          <SectionTitle level={3} icon={<FileCheckIcon />}>
            {t('subtitle_select_business_unit')}
          </SectionTitle>
          <Card bordered={false}>
            <div className="select-business">
              <div className="top-content mb-4">
                <Typography.Paragraph>
                  <div className="d-flex align-items-center mb-px-10">
                    <div className={styles['gray-label']}>{t('business_unit_name')}</div>
                    {(largeBusinessUnitDetails as any).name}
                  </div>
                  <div className="d-flex align-items-center mb-px-10">
                    <div className={styles['gray-label']}>{t('business_unit_level')}</div>
                    {t('common:large')}
                  </div>
                  <div className="d-flex align-items-center mb-0">
                    <div className={styles['gray-label']}>{t('department_in_charge')}</div>
                    {(largeBusinessUnitDetails as any).department?.name}
                  </div>
                </Typography.Paragraph>
              </div>
              {(largeBusinessUnitDetails as any).middleCategories?.length > 0 ? (
                <div className={classNames(styles['child-card'], 'p-4')}>
                  <Typography.Title level={5}>{t('edit__large_business_unit_children')}</Typography.Title>
                  {largeBusinessUnitDetails.middleCategories.map((item, key) => (
                    <div className="d-flex align-items-center" key={key}>
                      <EllipseIcon />
                      <Typography className="mx-px-10 mb-1">{item.name}</Typography>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border text-center">{t('message_no_business_unit_medium')}</div>
              )}
            </div>
          </Card>
        </Col>
        <Col md={12}>
          <SectionTitle level={3} icon={<FilePenIcon />}>
            {t('title_business_unit_edit')}
          </SectionTitle>
          <form onSubmit={handleSubmit(updateLargeBusiness)}>
            <Card bordered={false}>
              <section className={classNames(styles['name-change-section'])}>
                <Typography.Title level={4}>{t('change_business_name')}</Typography.Title>
                <Typography.Text className="text-normal" strong>
                  {t('name_changed')}
                </Typography.Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState: { error } }) => (
                    <FormItem validateStatus={error?.message ? 'error' : ''} className="mt-px-5 mb-0 border-input">
                      <Input {...field} size="large" />
                    </FormItem>
                  )}
                />
                <FormError name="name" errors={errors} />
              </section>

              <BusinessFormSelect businessUnit={largeBusinessUnitDetails} {...formProps} />

              <div className={classNames(styles['title-change-section'], 'mx-auto')}>
                <BusinessTitleChange
                  businessUnit={largeBusinessUnitDetails}
                  selectedBusinessUnit={{
                    selectedName,
                    selectedDepartmentId,
                  }}
                />
                <Spacer height="20px" />
                <div className="mb-px-10 d-flex justify-content-center">
                  <Button type="primary" className="mn-w180p font-weight-bold" size="large" htmlType="submit" loading={isUpdateLoading}>
                    {t('button_update_business_unit')}
                  </Button>
                </div>
                {(largeBusinessUnitDetails as any).middleCategories?.length === 0 && (
                  <div className="d-flex justify-content-end">
                    <Button type="link" className="link-underline" onClick={() => setIsModalDeleteVisible(true)}>
                      {t('delete_business_unit')}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </form>
        </Col>
      </Row>
      <UpdateBusinessSuccessModal
        isVisible={isModalUpdateSuccesslVisible}
        onOk={() => router.push(paths.master.businessUnit.index)}
        onCancel={() => router.push(paths.master.businessUnit.index)}
      />
      {isModalDeleteVisible && (
        <DeleteBusinessConfirmModal
          isVisible={isModalDeleteVisible}
          onCancel={() => setIsModalDeleteVisible(false)}
          onOk={deleteLargeBusiness}
          isDeleteLoading={isDeleteLoading}
          businessName={largeBusinessUnitDetails?.name}
          businessType={t('common:large')}
        />
      )}
      <DeleteBusinessSucessModal
        isVisible={isModalDeleteSucessVisible}
        onCancel={() => setIsModalDeleteSucessVisible(false)}
        onOk={() => router.push(paths.master.businessUnit.index)}
      />
      <GetBusinessDetailNotFound
        isVisible={isModalDetailNotFoundVisible}
        onOk={() => {
          setIsModalDetailNotFoundVisible(false);
          router.push(paths.master.businessUnit.index);
        }}
      />
      <CreateBusinessErrorModal
        message={t('create_unit__department_deleted')}
        isVisible={showDepartmentDeletedModal}
        onOk={() => setShowDepartmentDeletedModal(false)}
      />
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const {
    largeBusinessUnitDetails = {} as any,
    isLoading: businessUnitLoading,
    isUpdateLoading,
    isDeleteLoading,
  } = state.businessUnitReducer;
  const { departments, isLoading: departmentsLoading } = state.departmentReducer;
  return {
    departments,
    isUpdateLoading,
    largeBusinessUnitDetails,
    departmentsLoading,
    businessUnitLoading,
    isDeleteLoading,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetLargeBusinessDetails: (payload: Payload) => dispatch(getLargeBusinessUnitDetails(payload)),
  dispatchCleanLargeBusinessDetails: () => dispatch(cleanLargeBusinessUnitDetails()),
  dispatchGetDepartments: () => dispatch(getDepartments()),
  dispatchUpdateLargeBusiness: (payload: Payload) => dispatch(updateLargeBusinessUnit(payload)),
  dispatchDeleteLargeBusinessUnit: (payload: Payload) => dispatch(deleteLargeBusinessUnit(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
