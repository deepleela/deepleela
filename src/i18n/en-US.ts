
export const lang = {
    menu: {

        newgame_vs_leela: 'New Game (vs. Leela)',
        newgame_vs_self: 'New Game (vs. Self)',
        loadsgf: 'Load SGF',
        exportsgf: 'Export SGF',

        pass: 'Pass',
        resign: 'Resign',
        score: 'Score Game',

        about: 'About',
    },

    dialogs: {
        newgame: {
            title: 'New Game',
            yourColor: 'Your Color',
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
    },

    button: {
        ok: 'OK',
        cancel: 'Cancel',
    }
}