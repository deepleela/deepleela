
export const lang = {
    menu: {

        newgame_vs_leela: '新对局 (Leela对弈)',
        newgame_vs_self: '新对局 (自我对弈)',
        loadsgf: '载入SGF',
        exportsgf: '导出SGF',

        pass: '弃权',
        resign: '认输',
        score: '评分',

        about: '关于',
    },

    dialogs: {
        newgame: {
            title: '新对局',
            yourColor: '执子颜色',
            komi: '贴目',
            handicap: '让子',
            time: '游戏时间 (分钟)',
            black: '黑子',
            white: '白子',
        },

        sgf: {
            load: '导入 SGF',
            export: '导出 SGF',
        }
    },

    notifications: {
        serversBusy: (number) => `服务器繁忙，请稍后再试. 等待服务用户: ${number}`,
        aiNotAvailable: `本局暂时不会得到AI的建议`,
    },

    button: {
        ok: '确定',
        cancel: '取消',
    }
}