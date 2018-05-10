
export default class ThemeManager {

    static readonly default = new ThemeManager();

    constructor() {
        this.applyDefault();
    }

    gridLineColor: string;
    logoColor: string;
    subtextColor: string;

    applyDefault() {
        this.gridLineColor = '#efefef';
        this.logoColor = '#aaa';
        this.subtextColor = this.logoColor;
    }

    applyTransparent() {
        this.gridLineColor = '#efefef50';
        this.logoColor = '#ffffffA0';
        this.subtextColor = this.logoColor;
    }
}