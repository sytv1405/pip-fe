export const editButtonTitle = (type: 'edit' | 'new'): string => {
  return type === 'edit' ? '編集' : '登録';
};

export const editPageTitle = (type: 'edit' | 'new', title: string): string => {
  return type === 'edit' ? `${title}編集` : `新規${title}登録`;
};
