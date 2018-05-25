
export const lang = {
    menu: {
        cgos: '遛狗場',

        newgame_vs_leela: '對戰 AI',
        newgame_vs_self: '自由探索',
        loadsgf: '復盤 SGF',
        exportsgf: '導出 SGF',

        showHeatmap: '開啟 AI 預測',
        showWinrate: '自動顯示勝率',

        undo: '悔棋',
        pass: '棄權',
        resign: '認輸',
        score: '評分',

        settings: '設置',
        about: '關於',
    },

    dialogs: {
        newgame: {
            title: '新對局',
            yourColor: '執子顏色',
            engine: 'AI 引擎',
            komi: '貼目',
            handicap: '讓子',
            time: '對局時間 (分鐘)',
            black: '黑子',
            white: '白子',
            boardSize: '棋盤大小',
        },

        sgf: {
            load: '復盤 SGF',
            export: '導出 SGF',
            onlineMode: '在線模式',
            getChatBro: '申請',
        },

        info: {
            title_score: '對局形勢',
            resigns: (color: string) => `${color} 認輸`,
        },

        about: {
            title: '關於',
            text: {
                p1: 'DeepLeela 是一個開源圍棋輔助學習工具，其基於開源的圍棋AI Leela —— 開源版的AlphaGo。',
                p2: '通過使用 DeepLeela，您可以在線與 Leela/LeelaZero 下棋、把 SGF 導入復盤，讓 Leela 進行勝率分析。 您可以在任意時間、任何地點学习圍棋。',
                p3: '如果您喜歡該開源項目，欢迎对該項目进行贊助。',
                p4: 'leelazero@protonmail.com',                
            },
        },

        settings: {
            title: '設置',
            themes: '主題',
            theme_default: '默認',
            theme_purpink: '紫',
            theme_sky_blue: '天藍',
            theme_sublime_vivid: '昇華',
            theme_timber: '朝霞',
            theme_simple_yellow: '極簡黃',
            winrate: '勝率顯示',
            winrate_blackOnly: '僅顯示黑棋勝率',
            winrate_both: '顯示雙方勝率',
            winrateBase: '勝率基數',
            winrateBase_percent: '基於百分比顯示',
            winrateBase_500: '基於 500 顯示',
            nickname: '暱稱',
        }
    },

    cgos: {
        black: '黑棋',
        white: '白棋',
        date: '日期',
        time: '時間',
        result: '對局結果',
    },

    notifications: {
        serversBusy: (number) => `服務區繁忙. 等待服务用户: ${number}`,
        aiNotAvailable: `AI 繁忙，暫時不可用`,
        aiIsThinking: 'AI 正在思考...',
        invalidSgf: '無效 SGF，請重新填寫',
        resigns: (ai = 'AI') => `${ai} 認輸`,
        pass: (ai = 'AI') => `${ai} 棄權`,
    },

    button: {
        ok: '確定',
        cancel: '取消',
    },

    tips: {
        first: '第一手',
        backward: '向後 10 步',
        forward: '向前 10 步',
        previous: '上一步',
        next: '下一步',
        last: '最後',
        aithingking: '呼喚 AI',
        branch: '關閉分支',
    },
}