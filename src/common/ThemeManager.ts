import * as jQuery from 'jquery';
import UserPreferences from './UserPreferences';

export default class ThemeManager {

    static readonly default = new ThemeManager();
    static readonly themeColors = new Map<string, string>([
        ['default-theme', 'rgb(240, 171, 93)'],
        ['skyblue', '#47b2ff'],
        ['purpink', '#7f00ff'],
        ['sublime-vivid', '#fc466b'],
        ['timber', '#fc00ff'],
        ['simple-yellow', '#ffb649'],
        ['dark', '#151c1c'],
        ['metal', 'rgb(187, 187, 187)']
    ]);

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
    winrateColor?: string;

    get themeColor() { return ThemeManager.themeColors.get(this.theme) || 'rgb(240, 171, 93)'; }

    applyDefault() {
        this.gridLineColor = 'rgb(135, 85, 54)';// '#aaa';// '#efefef';
        this.logoColor = '#3c3c44';
        this.subtextColor = this.logoColor;
        this.whiteStoneColor = '#fff';// '#dedede';
        this.blackStoneColor = '#000'; //'#3c3c44';
        this.coordTextColor = this.gridLineColor;
        this.starPointColor = this.gridLineColor;// undefined;
        this.winrateColor = '#51494d';

        jQuery('html').removeClass().addClass('default-theme');
        UserPreferences.theme = 'default';
    }

    applyTransparent(theme: string) {
        this.gridLineColor = '#f0f0f050';
        this.logoColor = '#ffffffA0';
        this.subtextColor = this.logoColor;
        this.whiteStoneColor = '#fff';
        this.blackStoneColor = '#000'; //'#3c3c44';
        this.coordTextColor = '#ffffff80';
        this.starPointColor = undefined;
        this.winrateColor = '#ffffff';

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
        this.winrateColor = '#ffffff';

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