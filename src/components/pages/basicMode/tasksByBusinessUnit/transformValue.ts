import { Department, Objectliteral } from '@/types';

type SelectedBusinessOption = {
  departmentId: number;
  majorCategoryId?: number;
  middleCategoryId?: number;
  onlyBelongToMajor?: boolean;
  onlyBelongToDepartment?: boolean;
};

const getCorrectBusinessPath = (
  department: Department,
  selectedBusiness: SelectedBusinessOption
): Department & { isShowBusinessTasks?: boolean } => {
  const { majorCategoryId, middleCategoryId, onlyBelongToMajor, onlyBelongToDepartment } = selectedBusiness || {};
  const correctPath = { ...department };
  if (onlyBelongToDepartment) {
    delete correctPath.majorCategories;

    return {
      ...correctPath,
      isShowBusinessTasks: true,
    };
  }

  if (!majorCategoryId) {
    return {
      ...correctPath,
      isShowBusinessTasks: true,
      majorCategories: correctPath.majorCategories?.map(major => ({ ...major, isShowBusinessTasks: true })),
    };
  }

  if (!middleCategoryId) {
    return {
      ...correctPath,
      majorCategories: [
        ...(correctPath.majorCategories || [])
          .filter(major => major.id === majorCategoryId)
          .map(major => ({ ...major, isShowBusinessTasks: true, middleCategories: onlyBelongToMajor ? null : major.middleCategories })),
      ],
    };
  }

  const filteredMajors = (correctPath.majorCategories || [])?.filter(major => major.id === majorCategoryId);

  return {
    ...correctPath,
    majorCategories: [
      ...filteredMajors.map(major => ({
        ...major,
        middleCategories: [...(major.middleCategories || [])?.filter(middle => middle.id === middleCategoryId)], // eslint-disable-line no-unsafe-optional-chaining
      })),
    ],
  };
};

export const mappingBusinessTasks = (
  department: Department,
  businessTasks: Objectliteral[],
  selectedBusinessOption: SelectedBusinessOption
) => {
  let selectedDepartment = getCorrectBusinessPath(department, selectedBusinessOption);
  if (!selectedDepartment?.majorCategories?.length) {
    return { ...selectedDepartment, businessTasks };
  }
  const tasksOfDepartmentOnly = businessTasks?.filter(
    record => !record.majorCategory && !record.task?.majorCategory && !record.middleCategory && !record.task?.middleCategory
  );
  selectedDepartment = { ...selectedDepartment, businessTasks: tasksOfDepartmentOnly };

  selectedDepartment.majorCategories?.forEach(majorCategory => {
    const taskOfMajorOnly = (businessTasks || [])?.filter(
      record =>
        !record.middleCategory &&
        !record.task?.middleCategory &&
        (record.majorCategory?.id === majorCategory.id || record.task?.majorCategory?.id === majorCategory.id)
    );
    majorCategory.businessTasks = [...taskOfMajorOnly]; // eslint-disable-line no-param-reassign

    majorCategory.middleCategories?.forEach(middleCategory => {
      const tasksOfMiddle = (businessTasks || [])?.filter(
        record => record.middleCategory?.id === middleCategory.id || record.task?.middleCategory?.id === middleCategory.id
      );
      middleCategory.businessTasks = [...tasksOfMiddle]; // eslint-disable-line no-param-reassign
    });
  });

  return selectedDepartment;
};
