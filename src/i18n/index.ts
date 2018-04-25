import { lang as enUS } from './en-US';
import { lang as zhCN } from './zh-CN';

const langs = {
    'en-US': enUS,
    'zh-CN': zhCN,
};

const userLang: 'en-US' | 'zh-CN' = navigator.language as any;

export default (langs[userLang] || enUS);