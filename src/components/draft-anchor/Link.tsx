import React, { ReactElement, ReactNode } from 'react';
import { EditorState } from 'draft-js';

export interface LinkPubProps {
  children: ReactNode;
  entityKey: string;
  getEditorState(): EditorState;
}

interface LinkProps extends LinkPubProps {
  className?: string;
  target?: string;
}

const Link = ({ children, className, entityKey, getEditorState, target }: LinkProps): ReactElement => {
  const entity = getEditorState().getCurrentContent().getEntity(entityKey);
  const entityData = entity ? entity.getData() : undefined;
  const href = (entityData && entityData.url) || undefined;

  return (
    <a className={className} title={href} href={href} target={target} rel="noopener noreferrer">
      {children}
    </a>
  );
};

export default Link;
