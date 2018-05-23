
export const lang = {
    menu: {

        newgame_vs_leela: 'Challenge AI',
        newgame_vs_self: 'Free Practice',
        loadsgf: 'Review SGF',
        exportsgf: 'Export SGF',

        showHeatmap: 'Show Heatmap',
        showWinrate: 'Show Winrate',

        undo: 'Undo',
        pass: 'Pass',
        resign: 'Resign',
        score: 'Score Game',

        settings: 'Settings',
        about: 'About',
    },

    dialogs: {
        newgame: {
            title: 'New Game',
            yourColor: 'Your Color',
            engine: 'Go Engine',
            komi: 'Komi',
            handicap: 'Handicap',
            time: 'Time (minutes)',
            black: 'BLACK',
            white: 'WHITE',
            boardSize: 'Board Size',
        },

        sgf: {
            load: 'Review SGF',
            export: 'Export SGF',
            onlineMode: 'Online Mode',
            getChatBro: 'Get a ',
        },

        info: {
            title_score: 'Game Score',
            resigns: (color: string) => `${color} resigns`,
        },

        about: {
            title: 'About',
            text: {
                p1: 'DeepLeela is an open-source Go Learning Helper with Leela, which is an open-source go engine according to the AlphaGo paper.',
                p2: 'With DeepLeela, you can fight against Leela/LeelaZero, review your SGF, and get winrate information on your PC or your phone anywhere, anytime.',
                p3: 'If you like this project, you are welcome to sponsor us.',
            },
        },

        settings: {
            title: 'Settings',
            themes: 'Themes',
            theme_default: 'Default',
            theme_purpink: 'Purpink',
            theme_sky_blue: 'Sky Blue',
            theme_sublime_vivid: 'Sublime Vivid',
            theme_timber: 'Timber',
            theme_simple_yellow: 'Simple Yellow',
            winrate: 'Custom Winrate',
            winrate_blackOnly: 'Black only',
            winrate_both: 'Show both winrates',
            winrateBase: 'Winrate Base',
            winrateBase_percent: 'Percent-based',
            winrateBase_500: '500-based',
            nickname: 'Nickname',
        }
    },

    cgos: {
        black: 'Black',
        white: 'White',
        date: 'Date',
        time: 'Time',
        result: 'Result',
    },

    notifications: {
        serversBusy: (number) => `Service is busy, try it later. Pending users: ${number}`,
        aiNotAvailable: `You won't get AI's suggestions at this moment.`,
        aiIsThinking: 'AI is Thinking...',
        invalidSgf: 'Invalid SGF format',
        resigns: (ai: string = 'AI') => `${ai} resigns.`,
        pass: (ai: string = 'AI') => `${ai} passes`,
    },

    button: {
        ok: 'OK',
        cancel: 'Cancel',
    },

    tips: {
        first: 'First',
        previous: 'Previous',
        backward: 'Go Back 10 Moves',
        forward: 'Go Forward 10 Moves',
        next: 'Next',
        last: 'Last',
        aithingking: 'Call AI',
        branch: 'Close Branch',
    },
}