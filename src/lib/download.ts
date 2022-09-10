import iconv from 'iconv-lite';

export const download = (params: { filename: string; content: string }) => {
  const convetedContent = iconv.encode(params.content, 'Shift_JIS');
  const blob = new Blob([convetedContent], { type: 'text/csv;charset=sjis;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = params.filename;
  a.click();
};
