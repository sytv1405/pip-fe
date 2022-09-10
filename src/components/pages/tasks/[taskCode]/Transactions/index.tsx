import React, { useMemo, useState } from 'react';
import { groupBy, isEmpty } from 'lodash';
import moment from 'moment';
import { Button, Card, Collapse } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { useRouter } from 'next/router';
import { Dispatch } from 'redux';

import { Action, Objectliteral, Payload, Transaction } from '@/types';
import { convertToDateJP } from '@/utils/dateJp';
import { CollapseDownIcon, CollapseUpIcon, WorkRecordIcon } from '@/assets/images';
import { RootState } from '@/redux/rootReducer';
import { updateTransactionProcessStatus } from '@/redux/actions';
import { SectionTitle } from '@/components/Typography';

import styles from '../styles.module.scss';
import { ModalProps, TaskModalTypes } from '../types';
import ModalUpdateTransaction from '../modal/ModalUpdateTransaction';
import ModalCompleteTransaction from '../modal/ModalCompleteTransaction';

import TransactionItem from './TransactionItem';

interface TransactionsProps extends PropsFromRedux {
  t: (key: string, options?: Objectliteral) => string;
  isDisabledAction?: boolean;
  openCreateTransaction: () => void;
}

const Transactions = ({ transactions, taskDetail, isDisabledAction, t, openCreateTransaction }: TransactionsProps) => {
  const [modal, setModal] = useState<ModalProps>(null);
  const router = useRouter();

  const { transactionId: transactionIdQuery } = router.query;
  const transactionsByEra = useMemo(
    () =>
      groupBy(
        transactions?.sort((record1, record2) =>
          moment(record2.startDate || record2.createdAt).diff(record1.startDate || record1.createdAt)
        ),
        transaction => convertToDateJP(transaction.startDate || transaction.createdAt, 'reiwa')
      ),
    [transactions]
  );

  return (
    <>
      <div className={styles['transaction-container']}>
        <SectionTitle className={styles['header-transaction']} level={3} icon={<WorkRecordIcon />}>
          {t('work_record')}
        </SectionTitle>

        <Card bordered={false}>
          {isEmpty(transactionsByEra) ? (
            <>
              <div className={styles['transacton-no-record']}>{t('no_work_record')}</div>
              <div className="d-flex justify-content-center">
                <Button className="mn-w150p font-weight-bold text-regular" size="large" type="primary" onClick={openCreateTransaction}>
                  {t('start_task')}
                </Button>
              </div>
            </>
          ) : (
            Object.entries(transactionsByEra).map(([era, items]) => {
              const isOpen = transactionIdQuery ? items.some(e => e.id === +transactionIdQuery) : false;
              const defaultActiveKey = [convertToDateJP(Date.now(), 'reiwa')];
              if (isOpen) {
                defaultActiveKey.push(era);
              }
              return (
                <div className={styles['body-transaction']}>
                  <Collapse
                    ghost
                    className="ant-collapse--custom"
                    defaultActiveKey={defaultActiveKey}
                    expandIconPosition="right"
                    expandIcon={({ isActive }) => (isActive ? <CollapseUpIcon /> : <CollapseDownIcon />)}
                  >
                    <Collapse.Panel
                      header={<span className={styles['title-item-transaction']}>{`${era}${t('common:period')}`}</span>}
                      key={era}
                    >
                      <div>
                        {items
                          ?.sort((record1, record2) => {
                            if (!record2.startDate) return -1;
                            return moment(record2.startDate).diff(record1.startDate);
                          })
                          ?.map((transaction: Transaction) => (
                            <TransactionItem
                              key={transaction.id}
                              transaction={transaction}
                              isDisabledAction={isDisabledAction}
                              t={t}
                              setModal={setModal}
                              transactionIdQuery={transactionIdQuery as string}
                            />
                          ))}
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                </div>
              );
            })
          )}
        </Card>
      </div>
      {modal?.type === TaskModalTypes.UpdateTransaction && (
        <ModalUpdateTransaction
          visible
          onCompleteTransaction={() =>
            setModal({
              type: TaskModalTypes.CompleteTransaction,
              onCancel: () => setModal(null),
              transaction: modal?.transaction,
              task: taskDetail,
            })
          }
          {...modal}
        />
      )}
      {modal?.type === TaskModalTypes.CompleteTransaction && <ModalCompleteTransaction visible {...modal} />}
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  dispatchUpdateTransactionProcessStatus: (payload: Payload) => dispatch(updateTransactionProcessStatus(payload)),
});

const mapStateToProps = (state: RootState) => {
  const { taskDetail = {} as any, transactionProcessLoading, transactions } = state.taskReducer;
  return { taskDetail, transactionProcessLoading, transactions };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Transactions);
