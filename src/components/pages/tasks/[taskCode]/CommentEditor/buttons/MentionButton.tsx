import Editor from '@draft-js-plugins/editor';
import { EditorState, Modifier } from 'draft-js';
import React, { useCallback } from 'react';

import { EditorMentionIcon } from '@/assets/images';

import buttonStyles from '../buttonStyles.module.scss';

type MentionButtonProps = {
  getEditorState: () => EditorState;
  setEditorState: (editorState: EditorState) => void;
  editorRef: {
    current: Editor;
  };
};

const MentionButton = ({ getEditorState, setEditorState, editorRef }: MentionButtonProps) => {
  const editorState = getEditorState?.();

  const handleMention = useCallback(
    e => {
      e.stopPropagation();
      try {
        const newContentState = Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), '@');

        const newEditorState = EditorState.push(editorState, newContentState, 'insert-fragment');

        setEditorState(newEditorState);

        setTimeout(() => {
          editorRef.current?.focus();
        }, 200);
      } catch {
        // DO NOTHING
      }
    },
    [editorRef, editorState, setEditorState]
  );

  return (
    <div className={buttonStyles.buttonWrapper}>
      <button className={buttonStyles.button} onClick={handleMention}>
        <EditorMentionIcon />
      </button>
    </div>
  );
};

export default MentionButton;
