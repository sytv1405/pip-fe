import { Typography } from 'antd';
import { useSelector } from 'react-redux';

import { useTranslation } from 'i18next-config';
import { RootState } from '@/redux/rootReducer';
import { ArrowDownIcon, ArrowRightIcon } from '@/assets/images';

import styles from './styles.module.scss';

interface SelectedBusiness {
  selectedName?: string;
  selectedDepartmentId?: number;
  selectedMajorCategoryId?: number;
  selectedMiddleCategoryId?: number;
}
interface Props {
  businessUnit: any;
  selectedBusinessUnit: SelectedBusiness;
}

const BusinessTitleChange = (props: Props) => {
  const [t] = useTranslation('business_unit');

  const reduxSelector = useSelector((state: RootState) => {
    const { largeBusinessUnitsForSearch: largeBusinessUnits, mediumBusinessUnitsForSearch: mediumBusinessUnits } =
      state.businessUnitSearchReducer;
    const { departments } = state.departmentReducer;
    return {
      departments,
      largeBusinessUnits,
      mediumBusinessUnits,
    };
  });
  const { departments, largeBusinessUnits, mediumBusinessUnits } = reduxSelector;

  const { businessUnit, selectedBusinessUnit = {} } = props;
  const { selectedName, selectedDepartmentId, selectedMajorCategoryId, selectedMiddleCategoryId } = selectedBusinessUnit;

  const renderCurrentTitle = () => {
    return (
      <div className="d-flex align-items-center flex-wrap">
        {businessUnit?.department?.name && (
          <>
            <span className="mb-1 color-text">{businessUnit?.department?.name}</span>
            <ArrowRightIcon className="mx-1" />
          </>
        )}
        {businessUnit?.majorCategory?.name && (
          <>
            <span className="mb-1 color-text">{businessUnit?.majorCategory?.name}</span>
            <ArrowRightIcon className="mx-1" />
          </>
        )}
        {businessUnit?.middleCategory?.name && (
          <>
            <span className="mb-1 color-text">{businessUnit?.middleCategory?.name}</span>
            <ArrowRightIcon className="mx-1" />
          </>
        )}
        {businessUnit?.name && <span className="mb-1 color-text">{businessUnit?.name}</span>}
      </div>
    );
  };

  const renderNewTitle = () => {
    let departmentName = '';
    let majorCategoryName = '';
    let middleCategoryName = '';
    const name = selectedName || (businessUnit?.name ? businessUnit.name : '');

    if (selectedDepartmentId) {
      const department = departments.find(item => item.id === selectedDepartmentId);
      departmentName = department ? department?.name : '';
    } else {
      departmentName = businessUnit?.department?.name ? businessUnit?.department?.name : '';
    }

    if (selectedMajorCategoryId) {
      const largeBusinessUnit = largeBusinessUnits.find(item => item.id === selectedMajorCategoryId);
      majorCategoryName += largeBusinessUnit ? `${largeBusinessUnit?.name}` : '...';
    } else if (selectedDepartmentId !== businessUnit?.department?.id) {
      majorCategoryName += businessUnit.majorCategory ? '...' : '';
    } else {
      majorCategoryName += businessUnit?.majorCategory?.name ? `${businessUnit?.majorCategory?.name}` : '';
    }

    if (selectedMiddleCategoryId) {
      const mediumBusinessUnit = mediumBusinessUnits.find(item => item.id === selectedMiddleCategoryId);
      middleCategoryName += mediumBusinessUnit ? `${mediumBusinessUnit?.name}` : '...';
    } else if (selectedDepartmentId !== businessUnit?.department?.id) {
      middleCategoryName += businessUnit.middleCategory ? '...' : '';
    } else {
      middleCategoryName += businessUnit?.middleCategory?.name ? `${businessUnit?.middleCategory?.name}` : '';
    }

    return (
      <div className="d-flex align-items-center flex-wrap">
        {departmentName && (
          <>
            <span className="mb-1 color-text">{departmentName}</span>
            <ArrowRightIcon className="mx-1" />
          </>
        )}
        {majorCategoryName && (
          <>
            <span className="mb-1 color-text">{majorCategoryName}</span>
            <ArrowRightIcon className="mx-1" />
          </>
        )}
        {middleCategoryName && (
          <>
            <span className="mb-1 color-text">{middleCategoryName}</span>
            <ArrowRightIcon className="mx-1" />
          </>
        )}
        {name && <span className="mb-1 color-text">{name}</span>}
      </div>
    );
  };

  return (
    <>
      <Typography.Title level={5} className="text-center mb-3">
        {t('edit__subtitle_change_large_business_unit')}
      </Typography.Title>
      <div className={styles['title-field']}>
        <span className="font-weight-bold text-minimum mb-1 mr-3 color-text">{t('edit_mess_2')}</span>
        {renderCurrentTitle()}
      </div>
      <div className="my-px-10 d-flex justify-content-center">
        <ArrowDownIcon />
      </div>
      <div className={styles['title-field-new']}>
        <span className="font-weight-bold text-minimum mb-1 mr-3 color-text">{t('edit_mess_4')}</span>
        {renderNewTitle()}
      </div>
    </>
  );
};

export default BusinessTitleChange;
