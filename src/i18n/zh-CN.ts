
export const lang = {
    menu: {

        newgame_vs_leela: '新对局 (Leela 对弈)',
        newgame_vs_self: '新对局 (自我对弈)',
        loadsgf: '复盘 SGF',
        exportsgf: '导出 SGF',

        showHeatmap: '开启 AI 预测',
        showWinrate: '自动显示胜率',

        undo: '悔棋',
        pass: '弃权',
        resign: '认输',
        score: '评分',

        settings: '设置',
        about: '关于',
    },

    dialogs: {
        newgame: {
            title: '新对局',
            yourColor: '执子颜色',
            engine: 'AI 引擎',
            komi: '贴目',
            handicap: '让子',
            time: '游戏时间 (分钟)',
            black: '黑子',
            white: '白子',
        },

        sgf: {
            load: '复盘 SGF',
            export: '导出 SGF',
        },

        settings: {
            title: '设置',
            themes: '主题',
            theme_default: '默认',
            theme_purpink: '紫',
            theme_sky_blue: '天蓝',
            theme_sublime_vivid: '升华',
            theme_timber: '朝霞',
            theme_simple_yellow: '极简黄',
            winrate: '胜率显示',
            winrate_blackOnly: '仅显示黑棋胜率',
            winrate_both: '显示双方胜率',
        }
    },

    notifications: {
        serversBusy: (number) => `服务器繁忙，请稍后再试. 等待服务用户: ${number}`,
        aiNotAvailable: `本局暂时不会得到AI的建议`,
        aiIsThinking: 'AI 正在思考...',
        invalidSgf: '无效SGF，请重新填写',
    },

    button: {
        ok: '确定',
        cancel: '取消',
    },

    tips: {
        first: '开始',
        previous: '上一步',
        next: '下一步',
        last: '最后',
        aithingking: 'AI 思考'
    },
}