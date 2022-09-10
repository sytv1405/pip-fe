// alphanumeric + special characters
// ref: https://en.wikipedia.org/wiki/ASCII#Character_set
export const ORGANIZATION_CODE_REGEX = /^[\x21-\x7e]+$/;
export const FILENAME_REGEX = /^(?<filename>.+)(?<extention>\.[0-9a-z]*)$/;
export const MONTH_YEAR_REGEX = /^(?<month>[\d]{2})-(?<year>[\d]{4})$/;
export const TEL_REGEX = /\b(?:[-−－()（）]*\d){10,11}\b/gm;
