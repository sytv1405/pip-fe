import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor, { EditorCommand } from '@draft-js-plugins/editor';
import createMentionPlugin from '@draft-js-plugins/mention';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import classNames from 'classnames';
import { Button } from 'antd';
import { DraftHandleValue, EditorState, getDefaultKeyBinding, Modifier, RichUtils } from 'draft-js';
import prependHttp from 'prepend-http';

import createLinkPlugin from '@/utils/draft-js-plugin-anchor';
import { useTranslation } from 'i18next-config';
import { parseStringifiedRawContentToEditorState } from '@/utils/draft';
import { User } from '@/types';
import urlRegex from '@/utils/urlRegex';

import { EditorModes } from '../types';

import BoldButton from './buttons/BoldButton';
import ItalicButton from './buttons/ItalicButton';
import UnorderedListButton from './buttons/UnorderedListButton';
import OrderedListButton from './buttons/OrderedListButton';
import BlockquoteButton from './buttons/BlockquoteButton';
import MentionButton from './buttons/MentionButton';
import styles from './styles.module.scss';
import toolbarStyles from './toolbarStyles.module.scss';
import buttonStyles from './buttonStyles.module.scss';
import mentionStyles from './mentionStyles.module.scss';
import Mention from './Mention';
import MentionEntry from './MentionEntry';

export type CommentEditorProps = {
  mode: EditorModes;
  onSubmit: (editorState: EditorState, setEditorState: Dispatch<SetStateAction<EditorState>>) => void;
  onCancel?: () => void;
  defaultValue?: string;
  isSubmitting?: boolean;
  mentions: User[];
};

const CommentEditor = ({ mode, defaultValue, isSubmitting, onSubmit, onCancel, mentions }: CommentEditorProps) => {
  const [t] = useTranslation('task');

  const ref = useRef<Editor>(null);

  const [editorState, setEditorState] = useState(parseStringifiedRawContentToEditorState(defaultValue));
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);

  const { plugins, MentionSuggestions, Toolbar, LinkPluginButton } = useMemo(() => {
    const toolbarPlugin = createToolbarPlugin({
      theme: { toolbarStyles, buttonStyles },
    });
    const mentionPlugin = createMentionPlugin({
      theme: mentionStyles,
      mentionPrefix: '@',
      mentionComponent: props => <Mention {...props} mentions={mentions} />,
    });

    const linkPlugin = createLinkPlugin({
      placeholder: t('url_placeholder'),
    });

    return {
      plugins: [mentionPlugin, toolbarPlugin, linkPlugin],
      MentionSuggestions: mentionPlugin.MentionSuggestions,
      Toolbar: toolbarPlugin.Toolbar,
      LinkPluginButton: linkPlugin.LinkButton,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOpenChange = useCallback((_open: boolean) => {
    setOpen(_open);
  }, []);

  const onSearchChange = useCallback(
    ({ value }: { value: string }) => {
      const filteredSuggestions = mentions.filter(mention => !value || mention.name.toLowerCase().indexOf(value) > -1);

      setSuggestions(filteredSuggestions);
    },
    [mentions]
  );

  const handleCreateComment = useCallback(() => {
    onSubmit(editorState, setEditorState);
  }, [editorState, onSubmit]);

  const handleCancel = useCallback(() => {
    setEditorState(EditorState.createEmpty());
    onCancel?.();
  }, [onCancel]);

  const handleKeyCommand = useCallback(
    (command: EditorCommand): DraftHandleValue => {
      if (['bold', 'italic'].includes(command)) {
        const newEditorState = RichUtils.handleKeyCommand(editorState, command);

        if (newEditorState) {
          setEditorState(newEditorState);
          return 'handled';
        }
      }

      if (command === 'blockquote') {
        const newEditorState = RichUtils.toggleBlockType(editorState, 'blockquote');

        if (newEditorState) {
          setEditorState(newEditorState);
          return 'handled';
        }
      }

      if (['ordered-list-item', 'unordered-list-item'].includes(command)) {
        const newEditorState = RichUtils.toggleBlockType(editorState, command);

        const deletedSelection = newEditorState.getSelection().merge({
          anchorOffset: 0,
        });

        const newEditorContent = Modifier.removeRange(newEditorState.getCurrentContent(), deletedSelection, 'backward');

        setEditorState(EditorState.push(newEditorState, newEditorContent, 'remove-range'));

        return 'handled';
      }

      return 'not-handled';
    },
    [editorState]
  );

  const keyBindingFn = useCallback(
    (e): EditorCommand => {
      if (open) return undefined;

      const selection = editorState.getSelection();
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(selection.getStartKey());

      const startOffset = selection.getStartOffset();
      const endOffset = selection.getEndOffset();

      // shortcut for blockquote: >
      if (e.key === '>') {
        if (block.getType() === 'unstyled' && startOffset === 0) {
          return 'blockquote';
        }
      }

      // shortcut for list
      // unordered-list: -
      // ordered-list: 1.
      // + SPACE
      if (e.key === ' ') {
        if (block.getType() === 'unstyled' && startOffset === endOffset) {
          if (block.getText().slice(0, endOffset).trim() === '-') {
            return 'unordered-list-item';
          }

          if (block.getText().slice(0, endOffset).trim() === '1.') {
            return 'ordered-list-item';
          }
        }
      }

      return getDefaultKeyBinding(e);
    },
    [editorState, open]
  );

  const handlePastedText = useCallback(
    (text: string): DraftHandleValue => {
      const selection = editorState.getSelection();
      const url = prependHttp(text);

      if (
        urlRegex().test(url) &&
        (selection.getStartKey() !== selection.getEndKey() || selection.getStartOffset() !== selection.getEndOffset())
      ) {
        const contentState = editorState.getCurrentContent().createEntity('LINK', 'MUTABLE', { url });
        const entityKey = contentState.getLastCreatedEntityKey();
        const newEditorState = RichUtils.toggleLink(editorState, editorState.getSelection(), entityKey);

        setEditorState(
          EditorState.forceSelection(
            newEditorState,
            selection.merge({
              anchorKey: selection.getEndKey(),
              focusKey: selection.getEndKey(),
              anchorOffset: selection.getEndOffset(),
              focusOffset: selection.getEndOffset(),
            })
          )
        );
        return 'handled';
      }

      return 'not-handled';
    },
    [editorState]
  );

  const checkEmptyContentEditor = useCallback(
    (): boolean =>
      !editorState
        .getCurrentContent()
        .getBlocksAsArray()
        .some(block => !!block.getText().trim().length),
    [editorState]
  );

  useEffect(() => {
    if (mentions) setSuggestions(mentions);
  }, [mentions]);

  return (
    <div>
      <div className={styles.editor} onClick={() => ref.current?.focus()}>
        <Editor
          stripPastedStyles
          editorState={editorState}
          onChange={setEditorState}
          plugins={plugins}
          ref={ref}
          placeholder={t('comment_placeholder')}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={keyBindingFn}
          handlePastedText={handlePastedText}
        />
        <MentionSuggestions
          open={open}
          onOpenChange={onOpenChange}
          suggestions={suggestions}
          onSearchChange={onSearchChange}
          entryComponent={MentionEntry}
        />
        <Toolbar>
          {externalProps => (
            <>
              <BoldButton {...externalProps} />
              <ItalicButton {...externalProps} />
              <LinkPluginButton {...externalProps} />
              <OrderedListButton {...externalProps} />
              <UnorderedListButton {...externalProps} />
              <BlockquoteButton {...externalProps} />
              <MentionButton {...externalProps} editorRef={ref} />
            </>
          )}
        </Toolbar>
      </div>
      <div className={classNames(styles['list-btn-comments'], 'd-flex align-items-center justify-content-center')}>
        <Button className="mn-w130p font-weight-medium" onClick={handleCancel}>
          {mode === EditorModes.Update ? t('common:button_cancel') : t('button_cancel')}
        </Button>
        <Button
          className="mn-w130p font-weight-bold"
          type="primary"
          disabled={checkEmptyContentEditor()}
          onClick={handleCreateComment}
          loading={isSubmitting}
        >
          {mode === EditorModes.Update ? t('common:button_register') : t('button_send_comment')}
        </Button>
      </div>
    </div>
  );
};

export default CommentEditor;
