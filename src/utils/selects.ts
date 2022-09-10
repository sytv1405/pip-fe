import { Objectliteral } from '@/types';

function mapOptions(
  data: any,
  { labelKey, valueKey }: { labelKey: string | ((item: Objectliteral) => string); valueKey: string | ((item: Objectliteral) => any) }
) {
  return data?.map((item: any) => ({
    label: typeof labelKey === 'string' ? item[labelKey] : labelKey(item),
    value: typeof valueKey === 'string' ? item[valueKey] : valueKey(item),
    data: item,
  }));
}

function translateOptions(options: any[], t: (key: string) => string, namespace?: string) {
  return options.map((option: any) => ({
    ...option,
    label: t(namespace ? `${namespace}:${option.label}` : option.label),
  }));
}

function getKeyByValue(object: Objectliteral, value: any) {
  return Object.keys(object).find(key => object[key] === value);
}

export { mapOptions, translateOptions, getKeyByValue };
