import prependHttp from 'prepend-http';

import urlRegex from './urlRegex';
import mailRegex from './mailRegex';

const URLUtils = {
  isUrl(text: string): boolean {
    return urlRegex().test(text);
  },

  isMail(text: string): boolean {
    return mailRegex().test(text);
  },

  normalizeMail(email: string): string {
    if (email.toLowerCase().startsWith('mailto:')) {
      return email;
    }
    return `mailto:${email}`;
  },

  normalizeUrl(url: string): string {
    return prependHttp(url);
  },
};

export default URLUtils;
