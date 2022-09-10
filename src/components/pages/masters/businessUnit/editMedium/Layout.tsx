import React, { useCallback, useEffect, useState } from 'react';
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
  deleteMediumBusinessUnit,
  getLargeBusinessUnits,
  getMediumBusinessUnitDetails,
  cleanMediumBusinessUnitDetails,
  updateMediumBusinessUnit,
} from '@/redux/actions/businessUnitActions';
import { getDepartments } from '@/redux/actions';
import LoadingScreen from '@/components/LoadingScreen';
import { paths } from '@/shared/paths';
import { UpdateBusinessSuccessModal } from '@/components/pages/masters/businessUnit/modal/updateBusinessSuccess';
import { DeleteBusinessConfirmModal } from '@/components/pages/masters/businessUnit/modal/DeleteBusinessConfirm';
import { GetBusinessDetailNotFound } from '@/components/pages/masters/businessUnit/modal/getBusinessDetailNotFound';
import { ErrorCodes } from '@/shared/constants/errorCodes';
import { ArrowLeftIcon, EllipseIcon, FileCheckIcon, FilePenIcon } from '@/assets/images';
import { SectionTitle } from '@/components/Typography';

import { DeleteBusinessSucessModal } from '../modal/DeleteBusinessSucess';
import BusinessTitleChange from '../BusinessTitleChange';
import BusinessFormSelect from '../BusinessFormSelect';
import styles from '../styles.module.scss';

interface UpdateMediumBusinessUnit {
  departmentId: number;
  majorCategoryId: number;
  name: string;
}

// FIXME: use typescript instead of any
const Layout = ({
  mediumBusinessUnitDetails,
  departmentsLoading,
  isDeleteLoading,
  businessUnitLoading,
  isUpdateLoading,
  dispatchGetDepartments,
  dispatchUpdateMediumBusiness,
  dispatchGetMediumBusinessDetails,
  dispatchDeleteMediumBusinessUnit,
  dispatchleanMediumBusinessDetails,
}: PropsFromRedux) => {
  const [t] = useTranslation(['business_unit']);
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
        majorCategoryId: yup
          .number()
          .nullable()
          .required(t('common:please_select', { field: t('large_business_unit') })),
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
  const selectedMajorCategoryId = watch('majorCategoryId');

  const router = useRouter();
  const { id: mediumUnitId } = router.query;

  const [isModalUpdateSuccessVisible, setIsModalUpdateSuccessVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalDeleteSucessVisible, setIsModalDeleteSucessVisible] = useState(false);
  const [isModalDetailNotFoundVisible, setIsModalDetailNotFoundVisible] = useState(false);

  const updateMediumBusiness = useCallback(
    ({ name, departmentId, majorCategoryId }: UpdateMediumBusinessUnit) => {
      dispatchUpdateMediumBusiness({
        params: {
          ...(departmentId && { departmentId }),
          ...(majorCategoryId && { majorCategoryId }),
          ...(name && { name }),
          id: (mediumBusinessUnitDetails as any).id,
        },
        callback: () => {
          setIsModalUpdateSuccessVisible(true);
        },
        errorCallback: error => {
          if (error?.errorCode === ErrorCodes.DUPLICATE_CATEGORY) {
            setError('name', { message: t('business_name_duplicate') });
          }
        },
      });
    },
    [dispatchUpdateMediumBusiness, mediumBusinessUnitDetails, setError, t]
  );

  const deleteMediumBusiness = () => {
    dispatchDeleteMediumBusinessUnit({
      params: {
        id: mediumUnitId,
      },
      callback: () => {
        setIsModalDeleteVisible(false);
        setIsModalDeleteSucessVisible(true);
      },
    });
  };

  useEffect(() => {
    dispatchGetDepartments();
    dispatchGetMediumBusinessDetails({
      params: mediumUnitId,
      errorCallback: error => {
        if (error?.data?.errorCode === ErrorCodes.NOT_FOUND) {
          setIsModalDetailNotFoundVisible(true);
        }
      },
    });
  }, [dispatchGetDepartments, dispatchGetMediumBusinessDetails, mediumUnitId]);

  useEffect(() => {
    return () => {
      dispatchleanMediumBusinessDetails();
    };
  }, [dispatchleanMediumBusinessDetails]);

  useEffect(() => {
    setValue('name', mediumBusinessUnitDetails?.name);
  }, [mediumBusinessUnitDetails?.name, setValue]);

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
                    {(mediumBusinessUnitDetails as any).name}
                  </div>
                  <div className="d-flex align-items-center mb-px-10">
                    <div className={styles['gray-label']}>{t('business_unit_level')}</div>
                    {t('common:medium')}
                  </div>
                  <div className="d-flex align-items-center mb-0">
                    <div className={styles['gray-label']}>{t('department_in_charge')}</div>
                    {(mediumBusinessUnitDetails as any).department?.name}
                  </div>
                </Typography.Paragraph>
              </div>
              {(mediumBusinessUnitDetails as any).minorCategories?.length > 0 ? (
                <div className={classNames(styles['child-card'], 'p-4')}>
                  <Typography.Title level={5}>{t('edit__medium_business_unit_children')}</Typography.Title>
                  {(mediumBusinessUnitDetails as any)?.minorCategories.map((item, key) => (
                    <div className="d-flex align-items-center" key={key}>
                      <EllipseIcon />
                      <Typography className="mx-px-10 mb-1">{item.name}</Typography>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border text-center">{t('message_no_business_unit_small')}</div>
              )}
            </div>
          </Card>
        </Col>
        <Col md={12}>
          <SectionTitle level={3} icon={<FilePenIcon />}>
            {t('title_business_unit_edit')}
          </SectionTitle>
          <form onSubmit={handleSubmit(updateMediumBusiness)}>
            <Card bordered={false}>
              <section className={classNames(styles['name-change-section'])}>
                <Typography.Title level={4}>{t('change_business_name')}</Typography.Title>
                <Typography.Text strong>{t('name_changed')}</Typography.Text>
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

              <BusinessFormSelect businessUnit={mediumBusinessUnitDetails} {...formProps} />

              <div className={classNames(styles['title-change-section'], 'mx-auto')}>
                <BusinessTitleChange
                  businessUnit={mediumBusinessUnitDetails}
                  selectedBusinessUnit={{
                    selectedName,
                    selectedDepartmentId,
                    selectedMajorCategoryId,
                  }}
                />
                <div className="my-3 flex-center">
                  <Button type="primary" className="mn-w180p font-weight-bold" size="large" htmlType="submit" loading={isUpdateLoading}>
                    {t('button_update_business_unit')}
                  </Button>
                </div>
                {(mediumBusinessUnitDetails as any).minorCategories?.length === 0 && (
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
      <UpdateBusinessSuccessModal isVisible={isModalUpdateSuccessVisible} onOk={() => router.push(paths.master.businessUnit.index)} />
      <DeleteBusinessConfirmModal
        isVisible={isModalDeleteVisible}
        onCancel={() => setIsModalDeleteVisible(false)}
        onOk={deleteMediumBusiness}
        isDeleteLoading={isDeleteLoading}
        businessName={mediumBusinessUnitDetails?.name}
        businessType={t('common:medium')}
      />
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
    </WithAuth>
  );
};

const mapStateToProps = (state: RootState) => {
  const { mediumBusinessUnitDetails = {} as any, largeBusinessUnits, isUpdateLoading, isDeleteLoading } = state.businessUnitReducer;
  const { isLoading: businessUnitLoading } = state.businessUnitSearchReducer;
  const { departments, isLoading: departmentsLoading } = state.departmentReducer;
  return {
    departments,
    mediumBusinessUnitDetails,
    departmentsLoading,
    isUpdateLoading,
    businessUnitLoading,
    largeBusinessUnits,
    isDeleteLoading,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchGetDepartments: () => dispatch(getDepartments()),
  dispatchGetMediumBusinessDetails: (payload: Payload) => dispatch(getMediumBusinessUnitDetails(payload)),
  dispatchleanMediumBusinessDetails: () => dispatch(cleanMediumBusinessUnitDetails()),
  dispatchUpdateMediumBusiness: (payload: Payload) => dispatch(updateMediumBusinessUnit(payload)),
  dispatchGetLargeBusiness: (payload: Payload) => dispatch(getLargeBusinessUnits(payload)),
  dispatchDeleteMediumBusinessUnit: (payload: Payload) => dispatch(deleteMediumBusinessUnit(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Layout);
