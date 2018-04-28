
export const lang = {
    menu: {

        newgame: 'New Game',
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
        serversbusy: (number) => `Service is busy, try it later. Pending users: ${number}`,
    },

    button: {
        ok: 'OK',
        cancel: 'Cancel',
    }
}