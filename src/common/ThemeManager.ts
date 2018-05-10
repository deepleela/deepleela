import * as jQuery from 'jquery';

export default class ThemeManager {

    static readonly default = new ThemeManager();

    constructor() {
        this.theme = localStorage.getItem('theme') as string;
        this.applyTheme(this.theme);
    }

    theme: string;
    gridLineColor: string;
    logoColor: string;
    subtextColor: string;
    blackStoneColor: string;
    whiteStoneColor: string;

    applyDefault() {
        this.gridLineColor = '#efefef';
        this.logoColor = '#aaa';
        this.subtextColor = this.logoColor;
        this.whiteStoneColor = '#dedede';
        this.blackStoneColor = '#3c3c44';

        localStorage.setItem('theme', 'default');
        jQuery('html').removeClass();
    }

    applyTransparent(theme: string) {
        this.gridLineColor = '#efefef50';
        this.logoColor = '#ffffffA0';
        this.subtextColor = this.logoColor;
        this.whiteStoneColor = '#fff';
        this.blackStoneColor = '#3c3c44';

        jQuery('html').removeClass().addClass(theme);
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme: string) {
        if (!theme || theme === 'default') {
            this.applyDefault();
            return;
        }

        this.applyTransparent(theme);
        this.theme = theme;
    }
}