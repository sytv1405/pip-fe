import React from 'react';
import { last } from 'lodash';

import { FileExcelIcon, FileOtherIcon, FilePdfIcon, FilePowerpointIcon, FileWordIcon } from '@/assets/images';

type Props = {
  fileName: string;
};

const FileDynamicIcon = ({ fileName }: Props) => {
  const ext = last(fileName?.split('.'));

  switch (ext) {
    case 'xls':
    case 'xlsx':
      return <FileExcelIcon />;
    case 'doc':
    case 'docx':
      return <FileWordIcon />;
    case 'ppt':
    case 'pptx':
      return <FilePowerpointIcon />;
    case 'pdf':
      return <FilePdfIcon />;
    default:
      return <FileOtherIcon />;
  }
};

export default FileDynamicIcon;
