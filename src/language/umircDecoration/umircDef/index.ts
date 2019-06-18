import { env } from 'vscode';

import en from './en';
import zh_cn from './zh_cn';

export function getlang() {
  const sysLang = env.language.replace('-', '_');
  if (sysLang === 'en' || sysLang !== 'zh_cn') {
    return en;
  }
  return zh_cn;
}
