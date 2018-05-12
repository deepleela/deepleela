
export default class UserPreferences {

    static get winrateBlackOnly() { return localStorage.getItem('settings_winrate_blackonly') ? true : false; }
    static set winrateBlackOnly(value: boolean) { localStorage.setItem('settings_winrate_blackonly', value ? '1' : ''); }

    static get whitePlayer() { return localStorage.getItem('whiteplayer') || ''; }
    static set whitePlayer(value: string) { localStorage.setItem('whiteplayer', value); }

    static get blackPlayer() { return localStorage.getItem('blackplayer') || ''; }
    static set blackPlayer(value: string) { localStorage.setItem('blackplayer', value); }
}