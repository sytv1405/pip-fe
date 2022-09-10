import { writeFile, utils, read } from 'xlsx';
import { transform, invert } from 'lodash';
import moment from 'moment';

import { DATE_TIME_FORMAT_FILE_NAME } from '@/shared/constants';

type Options = {
  columnNames: Record<string, any>;
  transformData?: (value: any, key: any) => any;
};

export const formatXlsxJsonData = (data: any[], { columnNames, transformData }: Options) => {
  const columnKeys = invert(columnNames);

  return data.map(row =>
    transform(
      row,
      (result, value, columnName) => {
        const key = columnKeys[columnName as string] || columnName;
        // eslint-disable-next-line no-param-reassign
        result[key] = transformData ? transformData(value, key) : value;
      },
      {}
    )
  );
};

type ExportToXlsx = {
  data: any[][];
  fileName: string;
  columnWidths?: number[];
};

export const convertXlsxToJson = async (file: any): Promise<any[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const { SheetNames, Sheets } = read(arrayBuffer, { type: 'array' });
  const firstSheet = Sheets[SheetNames[0]];
  const jsonData = utils.sheet_to_json(firstSheet);

  return jsonData;
};

export const exportToXlsx = ({ data, fileName, columnWidths }: ExportToXlsx) => {
  const wb = utils.book_new();
  const ws = utils.aoa_to_sheet(data);

  if (columnWidths) {
    ws['!cols'] = columnWidths.map(width => ({ width }));
  }

  utils.book_append_sheet(wb, ws);

  writeFile(wb, fileName, { compression: true });
};

export const downloadFile = ({ href, fileName }: { href: string; fileName: string }): void => {
  const a = document.createElement('a');

  a.style.display = 'none';
  document.body.appendChild(a);

  a.href = href;
  a.setAttribute('download', fileName);

  a.click();
  document.body.removeChild(a);
};

type FormatDownloadFileNameOptions = {
  ext: string;
};

export const formatDownloadFileName = (fileName: string, { ext }: FormatDownloadFileNameOptions): string => {
  return `${fileName}_${moment().format(DATE_TIME_FORMAT_FILE_NAME)}.${ext}`;
};

export const getS3FileUrl = (fileName: string): string => {
  return `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${fileName}`;
};
