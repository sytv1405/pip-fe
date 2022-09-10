import { Button, Col, ModalProps, Row, Typography } from 'antd';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { EditorState } from 'draft-js';
import moment from 'moment';
import { useRouter } from 'next/router';

import { useTranslation } from 'i18next-config';
import { BinBrownIcon, EditBrownIcon } from '@/assets/images';
import { Comment } from '@/types/comment';
import { formatDateTime } from '@/utils/dateTimeUtils';
import {
  getMentionIdsFromEditorState,
  parseStringifiedRawContentToEditorState,
  parseStringifiedRawContentToHTML,
  stringifyEditorState,
} from '@/utils/draft';
import { deleteComment, getComments, updateComment } from '@/redux/actions';
import { Payload } from '@/types';
import message from '@/utils/message';
import { ModalInfo } from '@/components/modal';

import CommentEditor, { CommentEditorProps } from '../CommentEditor';
import { EditorModes } from '../types';

import styles from './styles.module.scss';

type CommentItemProps = { comment: Comment };

const CommentItem = ({
  comment,
  taskDetail,
  currentUser,
  users,
  isCommentSubmitting,
  isCommentDeleting,
  dispatchDeleteComment,
  dispatchUpdateComment,
  dispatchGetComments,
}: CommentItemProps & PropsFromRedux) => {
  const [t] = useTranslation('task');
  const [isEdit, setIsEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState<ModalProps>(null);
  const [modalDeleteSuccess, setModalDeleteSuccess] = useState<ModalProps>(null);
  const [modalWarningAddMention, setModalWarningAddMention] = useState<ModalProps>(null);
  const router = useRouter();
  const { commentId: commentIdQuery } = router.query;
  const focusElementRef = useRef(null);

  useEffect(() => {
    if (focusElementRef?.current) {
      focusElementRef?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  const canEditDeleteComment = useMemo(() => comment?.createdByUser?.id === currentUser?.id, [comment?.createdByUser?.id, currentUser?.id]);

  const contentHTML = parseStringifiedRawContentToHTML(comment.content);

  const handleUpdateComment: CommentEditorProps['onSubmit'] = useCallback(
    (editorState, setEditorState) => {
      const initialReceiverIds = getMentionIdsFromEditorState(parseStringifiedRawContentToEditorState(comment.content));
      const receiverIds = getMentionIdsFromEditorState(editorState);

      const submitHandler = () =>
        dispatchUpdateComment({
          params: {
            taskId: taskDetail.id,
            id: comment.id,
            content: stringifyEditorState(editorState),
          },
          callback: () => {
            setEditorState(EditorState.createEmpty());
            setIsEdit(false);
          },
          errorCallback: () => {
            setEditorState(EditorState.createEmpty());
            setIsEdit(false);
            message.error(t('message_comment_was_deleted'));
            dispatchGetComments({ params: { taskId: taskDetail?.id } });
          },
        });

      if (receiverIds.some(receiverId => !initialReceiverIds.includes(receiverId))) {
        setModalWarningAddMention({
          visible: true,
          onOk: () => {
            setModalWarningAddMention(null);
            submitHandler();
          },
          onCancel: () => setModalWarningAddMention(null),
        });
        return;
      }

      submitHandler();
    },
    [comment.content, comment.id, dispatchGetComments, dispatchUpdateComment, t, taskDetail.id]
  );

  const handleDeleteComment = () => {
    setModalDelete({
      visible: true,
      onOk: () =>
        dispatchDeleteComment({
          params: {
            taskId: taskDetail.id,
            id: comment.id,
          },
          callback: () => {
            setModalDelete(null);
            setModalDeleteSuccess({
              visible: true,
              onOk: () => setModalDeleteSuccess(null),
              onCancel: () => setModalDeleteSuccess(null),
            });
          },
          errorCallback: () => {
            message.error(t('message_comment_was_deleted'));
            dispatchGetComments({ params: { taskId: taskDetail?.id } });
          },
        }),
      onCancel: () => setModalDelete(null),
    });
  };

  return (
    <div
      key={comment?.id}
      className={styles['list-comment']}
      id={`comment-${comment?.id}`}
      {...{ ...(comment.id === +commentIdQuery ? { ref: focusElementRef } : {}) }}
    >
      <Row gutter={10} justify="space-between" align="middle" className={styles['list-comment-header']}>
        <Col className="d-flex align-items-center" flex="1">
          <Typography.Title className={classNames(styles['user-comment'], 'm-0 pr-4')} level={5}>
            {comment?.createdByUser?.name}
          </Typography.Title>
          <Typography.Paragraph className={styles['created-time-comment']}>{formatDateTime(comment?.createdAt)}</Typography.Paragraph>
        </Col>
        {canEditDeleteComment && !comment?.deletedAt && (
          <Col className="text-nowrap">
            <EditBrownIcon className="mr-2 cursor-pointer" onClick={() => setIsEdit(true)} />
            <BinBrownIcon className="cursor-pointer" onClick={handleDeleteComment} />
          </Col>
        )}
      </Row>
      {comment?.deletedAt ? (
        <div className={styles['deleted-message']}>{t('message_comment_was_deleted')}</div>
      ) : (
        <>
          {isEdit ? (
            <>
              <Typography.Title className={classNames(styles['title-edit-comment'])} level={5}>
                {t('edit_comment')}
              </Typography.Title>
              <CommentEditor
                mode={EditorModes.Update}
                onSubmit={handleUpdateComment}
                onCancel={() => setIsEdit(false)}
                defaultValue={comment?.content}
                isSubmitting={isCommentSubmitting}
                mentions={users}
              />
            </>
          ) : (
            <>
              <Typography.Paragraph className={styles['content-comment']}>
                <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
              </Typography.Paragraph>
              <Row justify="end" className={styles['edited-comment-component']}>
                <Col className={styles['edited-comment']}>
                  {!comment?.deletedAt && moment(comment?.createdAt).isBefore(comment?.modifiedAt) && `(${t('edited')})`}
                </Col>
              </Row>
            </>
          )}
        </>
      )}
      <ModalInfo title={t('modal_delete_title')} okText={t('common:delete')} confirmLoading={isCommentDeleting} {...modalDelete}>
        <div className="text-pre-line">{t('modal_delete_message')}</div>
      </ModalInfo>
      <ModalInfo title={t('modal_delete_title')} okText={t('common:button_close')} {...modalDeleteSuccess}>
        <div className="text-pre-line">{t('modal_delete_success_message')}</div>
      </ModalInfo>
      <ModalInfo
        title={t('modal_warning_add_mention_title')}
        {...modalWarningAddMention}
        footer={[
          <Button type="default" size="large" className="mn-w180p font-weight-bold" onClick={modalWarningAddMention?.onCancel}>
            {t('modal_warning_add_mention_cancel')}
          </Button>,
          <Button type="primary" size="large" className="mn-w180p font-weight-bold" onClick={modalWarningAddMention?.onOk}>
            {t('modal_warning_add_mention_submit')}
          </Button>,
        ]}
      >
        <div className="text-normal">{t('modal_warning_add_mention_content')}</div>
      </ModalInfo>
    </div>
  );
};

const mapStateToProps = state => {
  const { taskDetail, isCommentSubmitting, isCommentDeleting } = state.taskReducer;
  const { users } = state.userManagementReducer;
  const { user: currentUser } = state.authReducer;
  return { taskDetail, users, currentUser, isCommentSubmitting, isCommentDeleting };
};

const mapDispatchToProps = dispatch => ({
  dispatchDeleteComment: (payload: Payload) => dispatch(deleteComment(payload)),
  dispatchUpdateComment: (payload: Payload) => dispatch(updateComment(payload)),
  dispatchGetComments: (payload: Payload) => dispatch(getComments(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(CommentItem);
