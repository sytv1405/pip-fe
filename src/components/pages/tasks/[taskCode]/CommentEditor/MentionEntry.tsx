import { EntryComponentProps } from '@draft-js-plugins/mention/lib/MentionSuggestions/Entry/Entry';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import { omit } from 'lodash';

const MentionEntry = ({ mention, theme, currentUser, ...rest }: EntryComponentProps & PropsFromRedux) => {
  const [t] = useTranslation();

  const parentProps = omit(rest, ['isFocused', 'searchValue']);

  return (
    <div {...parentProps}>
      <span className={theme?.mentionSuggestionsEntryText}>
        {mention.id === currentUser.id ? `${mention.name}（${t('common:myself')}）` : mention.name}
      </span>
    </div>
  );
};

const mapStateToProps = state => {
  const { user: currentUser } = state.authReducer;
  return { currentUser };
};

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(MentionEntry);
