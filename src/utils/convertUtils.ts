import { identity, isString } from 'lodash';

type Options = {
  transformKey: (key: string) => string;
};

type ReturnArray = {
  label: string;
  value: string | number;
}[];

export const convertObjectToOptions = (object: Record<string, string | number>, options: Options): ReturnArray => {
  const { transformKey = identity } = options || {};

  return Object.entries(object).map(([key, value]) => ({
    label: transformKey(key),
    value,
  }));
};

export const parseBoolean = (value: any) => {
  switch (value) {
    case '1':
    case 'true':
      return true;
    case '0':
    case 'false':
      return false;
    default:
      return !!value;
  }
};

export const convertFullWidthNumberToHalfWidth = (fullWidthNumber: string | number): string | number => {
  if (!isString(fullWidthNumber)) return fullWidthNumber;

  return fullWidthNumber.replace(/[０-９]/g, fullWidthChar => String.fromCharCode(fullWidthChar.charCodeAt(0) - 0xfee0));
};
