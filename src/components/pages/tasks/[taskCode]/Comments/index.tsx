import { Button, Card, Collapse, Typography } from 'antd';
import classNames from 'classnames';
import { connect, ConnectedProps } from 'react-redux';
import { CSSProperties, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EditorState } from 'draft-js';
import { useRouter } from 'next/router';

import { useTranslation } from 'i18next-config';
import { CollapseDownIcon, CollapseUpIcon, MessageIcon } from '@/assets/images';
import { createComment } from '@/redux/actions';
import { Payload, User } from '@/types';
import { getMentionIdsFromEditorState, stringifyEditorState } from '@/utils/draft';
import { isMobile } from '@/utils/breakpointUtils';
import LoadingScreen from '@/components/LoadingScreen';

import CommentEditor, { CommentEditorProps } from '../CommentEditor';
import { EditorModes } from '../types';

import CommentItem from './CommentItem';
import styles from './styles.module.scss';

const MAX_COMMENTS_FIRST_VIEW = 5;

const Comments = ({
  currentUser,
  taskDetail,
  comments,
  users,
  isCommentSubmitting,
  isUsersLoading,
  dispatchCreateComment,
}: PropsFromRedux) => {
  const [t] = useTranslation('task');
  const [isCreateCommentEditorVisible, setCreateCommentEditorVisible] = useState(!isMobile());
  const [mentionPopover, setMentionPopover] = useState<{
    name: string;
    user: User;
    style: CSSProperties;
    mentionRect: DOMRect;
  }>(null);
  const mentionPopoverRef = useRef<HTMLDivElement>();
  const router = useRouter();
  const { commentId: commentIdQuery } = router.query;

  const maxCommentsFirstView = useMemo(() => {
    if (!commentIdQuery || !comments.length) return MAX_COMMENTS_FIRST_VIEW;

    if (comments.some(comment => comment.id === commentIdQuery)) return MAX_COMMENTS_FIRST_VIEW;

    return comments.length;
  }, [commentIdQuery, comments]);

  const handleCreateComment: CommentEditorProps['onSubmit'] = useCallback(
    (editorState, setEditorState) => {
      dispatchCreateComment({
        params: {
          taskId: taskDetail.id,
          content: stringifyEditorState(editorState),
          receiverIds: getMentionIdsFromEditorState(editorState).filter(receiverId => receiverId !== currentUser.id),
        },
        callback: () => {
          setEditorState(EditorState.createEmpty());
        },
      });
    },
    [currentUser.id, dispatchCreateComment, taskDetail.id]
  );

  const handleMouseOver = useCallback(
    e => {
      const { target } = e;

      if (target?.classList?.contains('mention') && target.dataset?.id) {
        const mentionId = +(target.dataset?.id as number);

        const mentionRect = target?.getBoundingClientRect();

        setMentionPopover({
          name: target.textContent.slice(1),
          user: users.find(user => user.id === mentionId),
          style: {
            top: `${mentionRect.top + mentionRect.height}px`,
            left: `${mentionRect?.left}px`,
            whiteSpace: 'nowrap',
          },
          mentionRect,
        });
      } else if (target !== mentionPopoverRef.current && !mentionPopoverRef.current?.contains(target)) {
        setMentionPopover(null);
      }
    },
    [users]
  );

  useLayoutEffect(() => {
    if (mentionPopoverRef.current) {
      const updatedStyle = { ...mentionPopover.style };
      let needUpdateStyle = false;

      if (mentionPopover?.mentionRect) {
        const popoverRect = mentionPopoverRef.current.getBoundingClientRect();

        if (popoverRect.top + popoverRect.height > window.innerHeight) {
          needUpdateStyle = true;
          updatedStyle.top = null;
          updatedStyle.bottom = `${window.innerHeight - mentionPopover.mentionRect.top}px`;
        }

        if (popoverRect.left + popoverRect.width > window.innerWidth) {
          needUpdateStyle = true;
          updatedStyle.left = null;
          updatedStyle.right = `${window.innerWidth - mentionPopover.mentionRect.right}px`;
        }
      }

      if (mentionPopover.style.whiteSpace === 'nowrap') {
        needUpdateStyle = true;
        updatedStyle.whiteSpace = null;
        updatedStyle.wordBreak = 'break-word';
      }

      if (needUpdateStyle) {
        setMentionPopover({
          ...mentionPopover,
          style: updatedStyle,
        });
      }
    }
  }, [mentionPopover]);

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (mentionPopover) {
        setMentionPopover(null);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [mentionPopover]);

  if (isUsersLoading) return <LoadingScreen />;

  return (
    <div id="comments" className={styles['comment-container']} onMouseOver={handleMouseOver}>
      {!!mentionPopover && (
        <div ref={mentionPopoverRef} className={styles['mention-popover']} style={mentionPopover?.style}>
          <h4 className={styles['mention-popover__title']}>{mentionPopover?.name}</h4>
          <div className={styles['mention-popover__body']}>
            <span className={styles['mention-popover__label']}>{t('modal_mention_department')}</span>
            <span>{mentionPopover?.user?.department?.name || '-'}</span>
          </div>
          {!mentionPopover?.user && (
            <div className={styles['mention-popover__deleted_message']}>{t('modal_mention_user_was_deleted_message')}</div>
          )}
        </div>
      )}
      <div className={classNames(styles['comment-header'], 'mt-4 d-flex align-items-center')}>
        <MessageIcon className="mr-2" />
        <Typography.Title level={3}>{t('comment')}</Typography.Title>
        <Typography.Paragraph>{t('total_comment', { count: comments?.length })}</Typography.Paragraph>
      </div>
      <Card bordered={false} className={styles['comment-body']}>
        {comments?.length > maxCommentsFirstView && (
          <Collapse
            ghost
            className="ant-collapse--comment"
            expandIcon={({ isActive }) => (isActive ? <CollapseUpIcon /> : <CollapseDownIcon />)}
          >
            <Collapse.Panel
              key={1}
              header={comments?.length ? t('total_past_comment', { count: comments.length - maxCommentsFirstView }) : t('change_log')}
            >
              {comments?.length &&
                comments
                  .slice(maxCommentsFirstView)
                  .reverse()
                  .map(content => <CommentItem comment={content} />)}
            </Collapse.Panel>
          </Collapse>
        )}
        {comments?.length ? (
          comments
            .slice(0, maxCommentsFirstView)
            .reverse()
            .map(item => <CommentItem comment={item} />)
        ) : (
          <div className={styles['no-comment-message']}>{t('no_comments_registered')}</div>
        )}
        <div className={styles['enter-comment']}>
          <Typography.Title className="mb-2 pr-4 hide-for-mobile" level={5}>
            {t('comment_entry_field')}
          </Typography.Title>
          {isCreateCommentEditorVisible && (
            <div className={styles['create-comment-editor-wrapper']}>
              <CommentEditor
                mode={EditorModes.Create}
                onSubmit={handleCreateComment}
                onCancel={() => isMobile() && setCreateCommentEditorVisible(false)}
                isSubmitting={isCommentSubmitting}
                mentions={users}
              />
            </div>
          )}
          {isMobile() && !isCreateCommentEditorVisible && (
            <div className="text-center d-block-for-mobile">
              <Button
                className={classNames(styles['btn-reply-mobile'], 'font-weight-bold')}
                type="primary"
                size="large"
                onClick={() => setCreateCommentEditorVisible(true)}
              >
                {t('button_comment_mobile')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const mapStateToProps = state => {
  const { user: currentUser } = state.authReducer;
  const { taskDetail, comments, isCommentSubmitting } = state.taskReducer;
  const { users, isLoading: isUsersLoading } = state.userManagementReducer;
  return { taskDetail, comments, users, isCommentSubmitting, currentUser, isUsersLoading };
};

const mapDispatchToProps = dispatch => ({
  dispatchCreateComment: (payload: Payload) => dispatch(createComment(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Comments);
