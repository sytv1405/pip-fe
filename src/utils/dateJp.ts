import moment from 'moment';

export const convertToDateJP = (datetime, type = 'text') => {
  if (!datetime) return '';
  const parts = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'short' }).formatToParts(new Date(datetime));
  const era = parts.find(item => item.type === 'era').value;
  const month = +parts.find(item => item.type === 'month').value;
  const day = +parts.find(item => item.type === 'day').value;
  const year = +parts.find(item => item.type === 'year').value;

  switch (type) {
    case 'dateOnly':
      return `${era}${year}年${month}月${day}日`;
    case 'dateTime':
      return `${era}${year}年${month}月${day}日${moment(datetime).format(' HH:mm')}`;
    case 'dateTimeWithoutSpace':
      return `${era}${year}年${month}月${day}日${moment(datetime).format('HH:mm')}`;
    case 'reiwa':
      return `${era}${month < 4 ? year - 1 : year}`;
    default:
      return `${era}${year}年${month}月${day}日`;
  }
};
