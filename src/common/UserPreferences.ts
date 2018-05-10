
export default class UserPreferences {

    static readonly instance = new UserPreferences();

    private constructor() {}

    get winrateBlackOnly() { return localStorage.getItem('settings_winrate_blackonly') ? true : false; }
    set winrateBlackOnly(value: boolean) { localStorage.setItem('settings_winrate_blackonly', value ? '1' : ''); }
}