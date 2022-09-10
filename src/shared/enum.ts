export enum BusinessUnitLevel {
  large = 'large',
  medium = 'medium',
  small = 'small',
}

export type BusinessUnitLevelType = keyof typeof BusinessUnitLevel;

export enum TaskStatus {
  OPEN = 'OPEN',
  TODO = 'TODO',
  DOING = 'DOING',
  COMPLETED = 'COMPlETED',
}

export enum TaskPeriodType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
  SPECIFIED = 'SPECIFIED',
}

export enum TaskDaysInWeek {
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
}

export enum JapaneseDaysInWeek {
  '日',
  '月',
  '火',
  '水',
  '木',
  '金',
  '土',
}
