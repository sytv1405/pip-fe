import { Transaction } from '@/types';

export enum TaskModalTypes {
  CreateTransaction = 'CreateTransaction',
  UpdateTransaction = 'UpdateTransaction',
  CompleteTransaction = 'CompleteTransaction',
  ActivateTask = 'ActivateTask',
}

export type ModalProps = {
  type: TaskModalTypes;
  isCompleted?: boolean;
  onCancel: () => void;
  onOk?: () => void;
  transaction?: Transaction;
  task?: any;
};

export enum EditorModes {
  Create = 'Create',
  Update = 'Update',
}
