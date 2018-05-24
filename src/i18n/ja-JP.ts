
export const lang = {
    menu: {
        cgos: 'CGOS',
        
        newgame_vs_leela: 'AIに挑戦する',
        newgame_vs_self: '自由に探索',
        loadsgf: 'SGF レビュー',
        exportsgf: 'SGF 輸出',

        showHeatmap: 'ヒートマップ 表示',
        showWinrate: '勝率 表示',

        undo: 'アンドゥ',
        pass: 'パス',
        resign: 'あきらめる',
        score: 'ゲーム スコア',

        settings: '設定',
        about: '情報',
    },

    dialogs: {
        newgame: {
            title: '新しいゲーム',
            yourColor: 'カラー',
            engine: 'AI エンジン',
            komi: 'コミ',
            handicap: 'ハンディキャップ',
            time: '時間 (分)',
            black: '黒番',
            white: '白番',
            boardSize: 'ボードサイズ',
        },

        sgf: {
            load: 'SGF レビュー',
            export: 'SGF 輸出',
            onlineMode: 'オンラインモード',
            getChatBro: 'Get a ',
        },

        info: {
            title_score: 'ゲーム スコア',
            resigns: (color: string) => `${color} 敗北`,
        },

        about: {
            title: '情報',
            text: {
                p1: 'DeepLeela is an open-source Go Learning Helper with Leela, which is an open-source go engine according to the AlphaGo paper.',
                p2: 'With DeepLeela, you can fight against Leela/LeelaZero, review your SGF, and get winrate information on your PC or your phone anywhere, anytime.',
                p3: 'If you like this project, you are welcome to sponsor us.',
            },
        },

        settings: {
            title: '設定',
            themes: 'テーマ',
            theme_default: 'デフォルト',
            theme_purpink: 'パープルピンク',
            theme_sky_blue: '空色',
            theme_sublime_vivid: '鮮やかな色',
            theme_timber: '木材',
            theme_simple_yellow: 'イエロー',
            winrate: '勝率 カスタム',
            winrate_blackOnly: '黒番',
            winrate_both: '両方も表示する',
            winrateBase: '勝率 ベース',
            winrateBase_percent: 'パーセンテージ',
            winrateBase_500: '500-ベース',
            nickname: 'ニックネーム',
        }
    },

    cgos: {
        black: '黒番',
        white: '白番',
        date: '日付',
        time: '時間',
        result: '結果',
    },

    notifications: {
        serversBusy: (number) => `Service is busy, try it later. Pending users: ${number}`,
        aiNotAvailable: `今 AI はしようできません`,
        aiIsThinking: 'AI は考え中...',
        invalidSgf: '無効な SGF',
        resigns: (ai: string = 'AI') => `${ai} 敗北`,
        pass: (ai: string = 'AI') => `${ai} パス`,
    },

    button: {
        ok: 'OK',
        cancel: 'キャンセル',
    },

    tips: {
        first: '最初',
        previous: '前',
        backward: '前 10 歩',
        forward: '前進 10 歩',
        next: '前進',
        last: '最後',
        aithingking: 'AI をコール',
        branch: 'ブランチを閉じる',
    },
}