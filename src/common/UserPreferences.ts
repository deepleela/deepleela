
export default class UserPreferences {

    static get kifu() { return localStorage.getItem('kifu') || ''; }
    static set kifu(value: string) { localStorage.setItem('kifu', value); }

    static get heatmap() { return localStorage.getItem('heatmap') ? true : false; }
    static set heatmap(enabled: boolean) { localStorage.setItem('heatmap', enabled ? 'true' : ''); }

    static get winrate() { return localStorage.getItem('winrate') ? true : false }
    static set winrate(enabled: boolean) { localStorage.setItem('winrate', enabled ? 'true' : ''); }

    static get winrateBlackOnly() { return localStorage.getItem('settings_winrate_blackonly') ? true : false; }
    static set winrateBlackOnly(value: boolean) { localStorage.setItem('settings_winrate_blackonly', value ? '1' : ''); }

    static get whitePlayer() { return localStorage.getItem('whiteplayer') || ''; }
    static set whitePlayer(value: string) { localStorage.setItem('whiteplayer', value); }

    static get blackPlayer() { return localStorage.getItem('blackplayer') || ''; }
    static set blackPlayer(value: string) { localStorage.setItem('blackplayer', value); }

    static get gameMode() { return localStorage.getItem('gamemode') || 'self'; }
    static set gameMode(value: string) { localStorage.setItem('gamemode', value) }

    static get userStone() { return localStorage.getItem('userstone') || 'B'; }
    static set userStone(value: string) { localStorage.setItem('userstone', value); }

    static get gameEngine() { return localStorage.getItem('gamengine') || ''; }
    static set gameEngine(value: string) { localStorage.setItem('gamengine', value); }

    static get komi() { return Number.parseInt(localStorage.getItem('komi') || '0'); }
    static set komi(value: number) { localStorage.setItem('komi', value.toString()); }
}