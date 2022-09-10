import React, { AnchorHTMLAttributes, ComponentType, ReactElement } from 'react';
import { EditorPlugin } from '@draft-js-plugins/editor';
import EditorUtils from '@draft-js-plugins/utils';
import { EditorState } from 'draft-js';

import DefaultLink, { LinkPubProps } from '@/components/draft-anchor/Link';
import LinkButton, { LinkButtonPubParams } from '@/components/draft-anchor/LinkButton';
import linkStrategy from '@/utils/linkStrategy';
import DefaultLinkButton, { DefaultLinkButtonProps } from '@/components/draft-anchor/DefaultLinkButton';
import defaultTheme from '@/components/draft-anchor/linkStyles.module.scss';
import { AnchorPluginTheme } from '@/types';

export type { DefaultLinkButtonProps } from '@/components/draft-anchor/DefaultLinkButton';

export interface AnchorPluginConfig {
  theme?: AnchorPluginTheme;
  placeholder?: string;
  Link?: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>>;
  linkTarget?: string;
  validateUrl?: (url: string) => boolean;
  LinkButton?: ComponentType<DefaultLinkButtonProps>;
}

export type AnchorPlugin = EditorPlugin & {
  LinkButton: ComponentType<LinkButtonPubParams>;
};

export interface AnchorPluginStore {
  getEditorState?(): EditorState;
  setEditorState?(state: EditorState): void;
}

const createLinkPlugin = (config: AnchorPluginConfig = {}): AnchorPlugin => {
  const { theme = defaultTheme, placeholder, Link, linkTarget, validateUrl, LinkButton: linkButton } = config;

  const store: AnchorPluginStore = {
    getEditorState: undefined,
    setEditorState: undefined,
  };

  const DecoratedDefaultLink = (props: LinkPubProps): ReactElement => <DefaultLink {...props} className={theme.link} target={linkTarget} />;

  const DecoratedLinkButton = (props: LinkButtonPubParams): ReactElement => (
    <LinkButton
      {...props}
      ownTheme={theme as AnchorPluginTheme}
      store={store}
      placeholder={placeholder}
      onRemoveLinkAtSelection={() => store.setEditorState?.(EditorUtils.removeLinkAtSelection(store.getEditorState?.()))}
      validateUrl={validateUrl}
      linkButton={linkButton || DefaultLinkButton}
    />
  );

  return {
    initialize: ({ getEditorState, setEditorState }) => {
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },

    decorators: [
      {
        strategy: linkStrategy,
        component: Link || DecoratedDefaultLink,
      },
    ],

    LinkButton: DecoratedLinkButton,
  };
};

export default createLinkPlugin;
