export const dateToJpEra = (date: Date): string => {
  return new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long' }).format(new Date(date));
};
