export const DEPARTMENT_XLSX_OPTIONS = {
  columnNames: {
    id: '部署ID',
    name: '部署名',
  },
  columnWidths: [10, 30],
  fileName: '部署マスタ',
};

export const REGULATION_XLSX_OPTIONS = {
  columnNames: {
    type: '規定種別',
    id: '規定ID',
    name: '規定名',
  },
  columnWidths: [20, 20, 20],
  fileName: '規定マスタ',
};

export const BUSINESS_UNIT_XLSX_OPTIONS = {
  small: {
    columnNames: {
      middleCategoryId: '業務ユニット（中）ID',
      id: '業務ユニット（小）ID',
      name: '業務ユニット（小）名',
    },
    columnWidths: [30, 30, 30],
    fileName: '業務ユニット（小）',
  },
  medium: {
    columnNames: {
      majorCategoryId: '業務ユニット（大）ID',
      id: '業務ユニット（中）ID',
      name: '業務ユニット（中）名',
    },
    columnWidths: [30, 30, 30],
    fileName: '業務ユニット（中）',
  },
  large: {
    columnNames: {
      departmentId: '部署ID',
      id: '業務ユニット（大）ID',
      name: '業務ユニット（大）名',
    },
    columnWidths: [10, 30, 30],
    fileName: '業務ユニット（大）',
  },
};

export const TASK_XLSX_OPTIONS = {
  fileName: 'タスク',
};
