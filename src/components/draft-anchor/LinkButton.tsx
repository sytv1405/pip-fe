import React, { ComponentType, MouseEvent, ReactElement } from 'react';
import EditorUtils from '@draft-js-plugins/utils';
import { EditorState } from 'draft-js';

import { AnchorPluginTheme } from '@/types';

import AddLinkForm, { OverrideContentProps } from './AddLinkForm';
import { DefaultLinkButtonProps, LinkButtonTheme } from './DefaultLinkButton';

export interface LinkButtonPubParams {
  theme?: LinkButtonTheme;
  onOverrideContent(component: ComponentType<OverrideContentProps> | undefined): void;
}

export interface AnchorPluginStore {
  getEditorState?(): EditorState;
  setEditorState?(state: EditorState): void;
}

interface LinkButtonParams extends LinkButtonPubParams {
  ownTheme: AnchorPluginTheme;
  store: AnchorPluginStore;
  placeholder?: string;
  onRemoveLinkAtSelection(): void;
  validateUrl?(url: string): boolean;
  linkButton: ComponentType<DefaultLinkButtonProps>;
}

const LinkButton = ({
  ownTheme,
  placeholder,
  onOverrideContent,
  validateUrl,
  theme,
  onRemoveLinkAtSelection,
  store,
  linkButton: InnerLinkButton,
}: LinkButtonParams): ReactElement => {
  const onAddLinkClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    const content = (contentProps: OverrideContentProps): ReactElement => (
      <AddLinkForm {...contentProps} placeholder={placeholder} theme={ownTheme} validateUrl={validateUrl} />
    );

    onOverrideContent(content);
  };

  const editorState = store.getEditorState?.();
  const hasLinkSelected = editorState ? EditorUtils.hasEntity(editorState, 'LINK') : false;

  return (
    <InnerLinkButton
      onRemoveLinkAtSelection={onRemoveLinkAtSelection}
      hasLinkSelected={hasLinkSelected}
      onAddLinkClick={onAddLinkClick}
      theme={theme}
    />
  );
};

export default LinkButton;
