import { lang as enUS } from './en-US';
import { lang as zhCN } from './zh-CN';
import { lang as jaJP } from './ja-JP';
import { lang as zhTW } from './zh-TW';

const langs = {
    'en-US': enUS,
    'zh-CN': zhCN,
    'ja-JP': jaJP,
    'zh-TW': zhTW,
};

const userLang: 'en-US' | 'zh-CN' = navigator.language as any;

export default (langs[userLang] || enUS);