import React, { MouseEvent, useCallback } from 'react';
import classNames from 'classnames';

import { EditorAttachmentIcon } from '@/assets/images';

export interface LinkButtonTheme {
  button?: string;
  active?: string;
  buttonWrapper?: string;
}

export interface DefaultLinkButtonProps {
  hasLinkSelected: boolean;
  onRemoveLinkAtSelection(): void;
  onAddLinkClick(event: MouseEvent): void;
  theme?: LinkButtonTheme;
}

export default function DefaultLinkButton({ hasLinkSelected, onRemoveLinkAtSelection, onAddLinkClick, theme }: DefaultLinkButtonProps) {
  const handleToggleLink = useCallback(
    e => {
      e.stopPropagation();

      return hasLinkSelected ? onRemoveLinkAtSelection() : onAddLinkClick(e);
    },
    [hasLinkSelected, onAddLinkClick, onRemoveLinkAtSelection]
  );

  return (
    <div className={theme?.buttonWrapper}>
      <button className={classNames(theme?.button, { [theme?.active]: hasLinkSelected })} onClick={handleToggleLink} type="button">
        <EditorAttachmentIcon />
      </button>
    </div>
  );
}
