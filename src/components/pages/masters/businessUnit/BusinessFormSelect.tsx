/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect } from 'react';
import { Typography, Row, Col } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Controller, UseFormReturn } from 'react-hook-form';

import { useTranslation } from 'i18next-config';
import SingleSelect from '@/components/SingleSelect';
import { FormError } from '@/components/form';
import { RootState } from '@/redux/rootReducer';
import { Payload } from '@/types';
import {
  getLargeBusinessUnitsForSearch,
  cleanLargeBusinessUnitsForSearch,
  getMediumBusinessUnitsForSearch,
  cleanMediumBusinessUnitsForSearch,
} from '@/redux/actions/businessUnitSearchActions';

import styles from './styles.module.scss';

interface Props extends UseFormReturn {
  businessUnit: any;
}

const BusinessFormSelect = (props: Props) => {
  const [t] = useTranslation('business_unit');
  const dispatch = useDispatch();
  const reduxSelector = useSelector((state: RootState) => {
    const { largeBusinessUnitsForSearch, mediumBusinessUnitsForSearch } = state.businessUnitSearchReducer;
    const { departments } = state.departmentReducer;
    return {
      departments,
      largeBusinessUnitsForSearch,
      mediumBusinessUnitsForSearch,
    };
  });
  const { departments, largeBusinessUnitsForSearch, mediumBusinessUnitsForSearch } = reduxSelector;

  const {
    control,
    formState: { errors },
    reset,
    watch,
    businessUnit,
    setValue,
    getValues,
  } = props;
  const departmentIdWatch = watch('departmentId');
  const majorCategoryIdWatch = watch('majorCategoryId');

  const dispatchGetLargeBusinessUnitsForSearch = (payload: Payload) => dispatch(getLargeBusinessUnitsForSearch(payload));
  const dispatchCleanLargeBusinessUnitsForSearch = () => dispatch(cleanLargeBusinessUnitsForSearch());
  const dispatchGetMediumBusinessUnitsForSearch = (payload: Payload) => dispatch(getMediumBusinessUnitsForSearch(payload));
  const dispatchCleanMediumBusinessUnitsForSearch = () => dispatch(cleanMediumBusinessUnitsForSearch());

  const handleChangeDepartment = useCallback(
    departmentId => {
      if (departmentId === departmentIdWatch) {
        return;
      }

      dispatchGetLargeBusinessUnitsForSearch({ params: { departmentIds: [departmentId] } });
      dispatchCleanLargeBusinessUnitsForSearch();
      dispatchCleanMediumBusinessUnitsForSearch();
      reset({
        ...getValues(),
        departmentId,
        majorCategoryId: null,
        middleCategoryId: null,
        minorCategoryId: null,
      });
    },
    [departmentIdWatch]
  );

  const handleChangeMajorBusiness = useCallback(
    majorCategoryId => {
      if (majorCategoryId === majorCategoryIdWatch) {
        return;
      }

      dispatchGetMediumBusinessUnitsForSearch({ params: { majorCategoryIds: [majorCategoryId] } });
      reset({
        ...getValues(),
        departmentId: departmentIdWatch,
        majorCategoryId,
        middleCategoryId: null,
        minorCategoryId: null,
      });
    },
    [majorCategoryIdWatch, departmentIdWatch]
  );

  useEffect(() => {
    if (businessUnit) {
      if (businessUnit.department) {
        setValue('departmentId', businessUnit.department?.id);
        dispatchGetLargeBusinessUnitsForSearch({ params: { departmentIds: [businessUnit.department?.id] } });
      }
      if (businessUnit.majorCategory) {
        setValue('majorCategoryId', businessUnit.majorCategory?.id);
        dispatchGetMediumBusinessUnitsForSearch({ params: { majorCategoryIds: [businessUnit.majorCategory?.id] } });
      }
      if (businessUnit.middleCategory) {
        setValue('middleCategoryId', businessUnit.middleCategory?.id);
      }
    }
  }, [businessUnit, setValue]);

  useEffect(() => {
    return () => {
      dispatchCleanLargeBusinessUnitsForSearch();
      dispatchCleanMediumBusinessUnitsForSearch();
    };
  }, []);

  return (
    <section className="section">
      <Typography.Title level={4} className="title mb-0">
        {t('change_business_parent')}
      </Typography.Title>
      <Row gutter={24} className={styles['business-form-select']}>
        {businessUnit.department ? (
          <Col flex="0 0 220px" className={styles['select-business-unit']}>
            <Typography.Text className={styles['select-business-unit__title']} strong>
              {t('department_in_charge')}
            </Typography.Text>
            <Controller
              control={control}
              name="departmentId"
              render={({ field: { onChange, value } }) => (
                <SingleSelect
                  options={departments.map(item => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  onChange={departmentId => {
                    onChange(departmentId);
                    handleChangeDepartment(departmentId);
                  }}
                  value={value}
                  className="mt-px-5"
                />
              )}
            />
            <FormError name="departmentId" errors={errors} />
          </Col>
        ) : (
          ''
        )}
        {businessUnit.majorCategory ? (
          <Col flex="0 0 220px" className={styles['select-business-unit']}>
            <Typography.Text className={styles['select-business-unit__title']} strong>
              {t('business_unit_lg')}
            </Typography.Text>
            <Controller
              control={control}
              name="majorCategoryId"
              render={({ field: { onChange, value } }) => (
                <SingleSelect
                  options={largeBusinessUnitsForSearch.map(item => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  onChange={majorCategoryId => {
                    onChange(majorCategoryId);
                    handleChangeMajorBusiness(majorCategoryId);
                  }}
                  value={value}
                  className="mt-px-5"
                />
              )}
            />
            <FormError name="majorCategoryId" errors={errors} />
          </Col>
        ) : (
          ''
        )}
        {businessUnit.middleCategory ? (
          <Col flex="0 0 220px" className={styles['select-business-unit']}>
            <Typography.Text className={styles['select-business-unit__title']} strong>
              {t('business_unit_md')}
            </Typography.Text>
            <Controller
              control={control}
              name="middleCategoryId"
              render={({ field: { onChange, value } }) => (
                <SingleSelect
                  options={mediumBusinessUnitsForSearch.map(item => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  value={value}
                  onChange={onChange}
                  className="mt-px-5"
                />
              )}
            />
            <FormError name="middleCategoryId" errors={errors} />
          </Col>
        ) : (
          ''
        )}
      </Row>
    </section>
  );
};

export default BusinessFormSelect;
