
export const lang = {
    menu: {
        cgos: '遛狗场',

        newgame_vs_leela: '对战 AI',
        newgame_vs_self: '自由探索',
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
            boardSize: '棋盘大小',
        },

        sgf: {
            load: '复盘 SGF',
            export: '导出 SGF',
            onlineMode: '在线模式',
            getChatBro: '申请',
        },

        info: {
            title_score: '对局形势',
            resigns: (color: string) => `${color} 认输`,
        },

        about: {
            title: '关于',
            text: {
                p1: 'DeepLeela 是一个开源的围棋学习辅助工具，其基于开源的围棋软件 Leela —— 开源版的AlphaGo。',
                p2: '通过使用 DeepLeela，您可以在线与 Leela/LeelaZero 对局、将 SGF 导入进行自我复盘，让 Leela 进行胜率分析。 从此您可以在任何时间、任何地点学习围棋。',
                p3: '如果您喜欢该项目，欢迎对该项目进行赞助。',
                p4: 'leelazero@protonmail.com',
            },
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
            theme_dark: '黑暗',
            theme_metal: '金属',
            winrate: '胜率显示',
            winrate_blackOnly: '仅显示黑棋胜率',
            winrate_both: '显示双方胜率',
            winrateBase: '胜率基数',
            winrateBase_percent: '基于百分比显示',
            winrateBase_500: '基于 500 显示',
            nickname: '昵称',
        }
    },

    cgos: {
        black: '黑棋',
        white: '白棋',
        date: '日期',
        time: '时间',
        result: '比赛结果',
    },

    notifications: {
        serversBusy: (number) => `服务器繁忙，请稍后再试. 等待服务用户: ${number}`,
        aiNotAvailable: `本局暂时不会得到AI的建议`,
        aiIsThinking: 'AI 正在思考...',
        invalidSgf: '无效SGF，请重新填写',
        resigns: (ai = 'AI') => `${ai} 认输`,
        pass: (ai = 'AI') => `${ai} 弃权`,
    },

    button: {
        ok: '确定',
        cancel: '取消',
    },

    tips: {
        first: '开始',
        backward: '向后 10 步',
        forward: '向前 10 步',
        previous: '上一步',
        next: '下一步',
        last: '最后',
        aithingking: '召唤 AI',
        branch: '关闭分支',
    },
}