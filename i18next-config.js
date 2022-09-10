const path = require('path');

const NextI18Next = require('next-i18next').default;

module.exports = new NextI18Next({
  defaultLanguage: 'ja',
  otherLanguages: ['en'],
  localePath: path.resolve('./public/static/locales'),
  serverLanguageDetection: false,
});
