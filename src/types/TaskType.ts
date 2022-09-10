import { UploadFile } from 'antd/lib/upload/interface';

export type TaskType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdPerson: string;
  updatedPerson: string;

  title: string;
  department?: string;
  category?: {
    majorCategory?: string;
    middleCategory?: string;
    minorSubCategory?: string;
  };
  processType?: '期限基準' | '発生基準';
  period?: {
    type: 'weekly' | 'monthly' | 'annually' | 'any';
    period: Date | Date[];
  };
  leadTime?: {
    type: 'week' | 'month' | 'year';
    time: number;
  };
  // TODO この二つ
  startAt: Date;
  finishAt: Date;
  means?: {
    key: string;
    task?: string;
    department?: TaskType['department'];
    outcome?: string;
  }[];
  memo?: string;
  files?: UploadFile[];
  departmentOfDuties?: {
    kind?: string;
    chapter?: string;
    regulation?: string;
    relevantItem?: string;
    url?: string;
  };
  log: {
    type: string;
    createdAt: Date;
    createdPerson: string;
  }[];
};
