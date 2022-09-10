require('dotenv').config({ path: './.env' });
const fs = require('fs');
const path = require('path');

const xlsx = require('xlsx');

const TAB_SIZE = 2;
const START_ROW = 2;
const COL_FILE_NAME = 'Module';
const COL_KEY = 'Key';
const COL_JA = 'JA';
const COL_EN = 'EN';

function transform(sheet, row, index) {
  const fileName = row[COL_FILE_NAME];
  const key = row[COL_KEY];
  const ja = row[COL_JA] || '';
  const en = row[COL_EN] || '';
  const error = errorAt => new Error(`[Sheet: ${sheet}, Row: ${index + START_ROW}, Column: ${errorAt}] Must not be empty`);

  switch (true) {
    case !fileName && !key && !ja && !en:
      return [];
    case !key:
      throw error(COL_KEY);
    case !fileName:
      throw error(COL_FILE_NAME);
    case !ja:
      throw error(COL_JA);
    case !en:
      throw error(COL_EN);
    default:
      return [fileName, key, ja, en];
  }
}

function getArgv() {
  const input = process.env.I18N_INPUT;
  const output = process.env.I18N_OUTPUT;
  const sheets = (process.env.I18N_SHEETS || '').split(',');

  if (!input) {
    throw new Error('Please enter the path to the xlsx file with I18N_INPUT');
  }
  if (!output) {
    throw new Error('Please enter the path to the output dir with I18N_OUTPUT');
  }
  if (!sheets) {
    throw new Error('Please enter the list of sheet with I18N_SHEETS');
  }

  return { input, output, sheets };
}

function createJsonFiles(output, fileName, jsonData) {
  const { ja, en } = jsonData;
  const jaFilePath = path.resolve(output, 'ja', `${fileName}.json`);
  const enFilePath = path.resolve(output, 'en', `${fileName}.json`);
  fs.writeFile(jaFilePath, `${JSON.stringify(ja, null, TAB_SIZE)}\n`, error => {
    if (error) {
      throw error;
    }
    /* eslint-disable no-console */
    console.log(`Completed: ${jaFilePath}`);
  });
  fs.writeFile(enFilePath, `${JSON.stringify(en, null, TAB_SIZE)}\n`, error => {
    if (error) {
      throw error;
    }
    /* eslint-disable no-console */
    console.log(`Completed: ${enFilePath}`);
  });
}

function convert() {
  const { input, output, sheets } = getArgv();
  const workbook = xlsx.readFile(input, { sheets });
  const jsonData = {};

  Object.keys(workbook.Sheets).forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { blankrows: true });

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const [fileName, key, ja, en] = transform(sheetName, row, i);

      if (fileName) {
        jsonData[fileName] = jsonData[fileName] || { ja: {}, en: {} };
        jsonData[fileName].ja[key] = ja;
        jsonData[fileName].en[key] = en;
      }
    }
  });

  Object.keys(jsonData).forEach(fileName => {
    createJsonFiles(output, fileName, jsonData[fileName]);
  });
}

convert();
