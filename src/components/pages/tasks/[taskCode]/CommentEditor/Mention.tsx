import React, { CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import { MentionData } from '@draft-js-plugins/mention';

import { useTranslation } from 'i18next-config';
import { User } from '@/types';

import styles from './styles.module.scss';

type MentionProps = {
  className: string;
  mention: MentionData;
  mentions: User[];
};

const Mention: React.FC<MentionProps> = ({ children, className, mention, mentions }) => {
  const [t] = useTranslation('task');
  const mentionPopoverRef = useRef<HTMLDivElement>();

  const [mentionPopover, setMentionPopover] = useState<{
    name: string;
    user: User;
    style: CSSProperties;
    mentionRect: DOMRect;
  }>(null);

  const handleMouseEnter = e => {
    const { target } = e;

    const mentionRect = target?.getBoundingClientRect();

    setMentionPopover({
      name: target.textContent.slice(1),
      user: mentions.find(record => record.id === mention.id),
      style: {
        top: `${mentionRect.top + mentionRect.height}px`,
        left: `${mentionRect?.left}px`,
        whiteSpace: 'nowrap',
      },
      mentionRect,
    });
  };

  const handleMouseLeave = () => {
    setMentionPopover(null);
  };

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
    document.querySelector('.DraftEditor-root')?.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.querySelector('.DraftEditor-root')?.addEventListener('scroll', handleScroll);
    };
  }, [mentionPopover]);

  return (
    <>
      <span className={className} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
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
      </span>
    </>
  );
};

export default Mention;
