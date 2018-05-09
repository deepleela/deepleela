
export const lang = {
    menu: {

        newgame_vs_leela: 'New Game (vs. Leela)',
        newgame_vs_self: 'New Game (vs. Self)',
        loadsgf: 'Review SGF',
        exportsgf: 'Export SGF',

        showHeatmap: 'Show Heatmap',
        showWinrate: 'Show Winrate',

        pass: 'Pass',
        resign: 'Resign',
        score: 'Score Game',

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
        },

        sgf: {
            load: 'Load SGF',
            export: 'Export SGF',
        }
    },

    notifications: {
        serversBusy: (number) => `Service is busy, try it later. Pending users: ${number}`,
        aiNotAvailable: `You won't get AI's suggestions at this moment.`,
        aiIsThinking: 'AI is thinking...',
        invalidSgf: 'Invalid SGF format',
    },

    button: {
        ok: 'OK',
        cancel: 'Cancel',
    },

    tips: {
        first: 'First',
        previous: 'Previous',
        next: 'Next',
        last: 'Last',
        aithingking: 'AI Thinking'
    },
}