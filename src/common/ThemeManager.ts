import * as jQuery from 'jquery';
import UserPreferences from './UserPreferences';

export default class ThemeManager {

    static readonly default = new ThemeManager();

    constructor() {
        this.theme = UserPreferences.theme;
        this.applyTheme(this.theme);
    }

    theme: string;
    gridLineColor: string;
    logoColor: string;
    subtextColor: string;
    blackStoneColor: string;
    whiteStoneColor: string;
    coordTextColor: string;
    starPointColor?: string;

    applyDefault() {
        this.gridLineColor = '#efefef';
        this.logoColor = '#aaa';
        this.subtextColor = this.logoColor;
        this.whiteStoneColor = '#dedede';
        this.blackStoneColor = '#3c3c44';
        this.coordTextColor = '#ccc';
        this.starPointColor = undefined;

        jQuery('html').removeClass();
        UserPreferences.theme = 'default';
    }

    applyTransparent(theme: string) {
        this.gridLineColor = '#f0f0f050';
        this.logoColor = '#ffffffA0';
        this.subtextColor = this.logoColor;
        this.whiteStoneColor = '#fff';
        this.blackStoneColor = '#3c3c44';
        this.coordTextColor = '#ffffff80';
        this.starPointColor = undefined;

        jQuery('html').removeClass().addClass(theme);
        UserPreferences.theme = theme;
    }

    applyMetal() {
        this.gridLineColor = '#444444bb';
        this.logoColor = '#ffffffA0';
        this.subtextColor = this.logoColor;
        this.whiteStoneColor = '#fff';
        this.blackStoneColor = '#000';
        this.coordTextColor = this.gridLineColor;
        this.starPointColor = '#444';

        jQuery('html').removeClass().addClass('metal');
        UserPreferences.theme = 'metal';
    }

    applyTheme(theme: string) {
        if (!theme || theme === 'default') {
            this.applyDefault();
            return;
        }

        if (theme === 'metal') {
            this.applyMetal();
            return;
        }

        this.applyTransparent(theme);
        this.theme = theme;
    }
}