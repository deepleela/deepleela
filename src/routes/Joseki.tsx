import * as React from 'react';
import BoardController from '../widgets/BoardController';
import SmartGoBoard from '../widgets/SmartGoBoard';
import { RouteComponentProps } from 'react-router-dom';
import GameClient from '../common/GameClient';
import UserPreferences from '../common/UserPreferences';
import Go from '../common/Go';
import SGF from '../common/SGF';
import { State } from '../components/Intersection';
import { ReviewRoomState, ReviewRoomInfo, Protocol } from 'deepleela-common';
import ThemeManager from '../common/ThemeManager';
import CGOSClient, { Setup, Update } from '../common/CGOSClient';
import Board from '../components/Board';
import LoadingDialog from '../dialogs/LoadingDialog';
import MessageBar from '../widgets/MessageBar';
import * as jQuery from 'jquery';
import Axios from 'axios';
import { Tree } from 'sgfjs';

interface States {
    heatmap: number[][];
}

export default class Joseki extends React.Component<{}, States> {

    board: Board;
    game = new Go(19);
    joseki: Tree[];
    path: number[] = [];

    constructor(props: any, ctx: any) {
        super(props, ctx);

        let heatmap: number[][] = [];
        for (let i = 0; i < 19; i++) {
            let row: number[] = [];
            heatmap.push(row);
            for (let j = 0; j < 19; j++) {
                row.push(0);
            }
        }

        this.state = { heatmap };
    }

    async componentDidMount() {
        let sgf = await this.loadResource();
        if (!sgf) return;

        this.joseki = sgf;
        this.fetchHeatmap();

        this.forceUpdate();
    }

    async loadResource() {
        let joseki = (await Axios.get('/2017Joseki.sgf')).data as string;
        if (!joseki) return;

        return SGF.parse(joseki);
    }

    fetchHeatmap() {
        this.clearHeatmap();

        let tree: undefined | Tree[] = this.joseki;
        for (let i = 0; i < this.path.length; i++) {
            if (!tree) break;
            let child: Tree = tree[this.path[i]];
            if (!child) break;
            tree = child.childs;
        }

        if (!tree) return;

        for (let i = 0; i < tree.length; i++) {
            let node = tree[i];
            let coord = (node.props.W || node.props.B)!;
            let pos = SGF.stringToArrayPosition(coord);

            if (pos.x < 0 || pos.x > 18 || pos.y < 0 || pos.y > 18) continue;
            this.state.heatmap[pos.x][pos.y] = 0.45;
        }
    }

    clearHeatmap() {
        for (let i = 0; i < 19; i++) {
            for (let j = 0; j < 19; j++) {
                this.state.heatmap[i][j] = 0;
            }
        }
    }

    onStonePlaced(x: number, y: number) {
        let { x: ax, y: ay } = Board.cartesianCoordToArrayPosition(x, y, 19);
        let value = this.state.heatmap[ax][ay];
        if (!value) return;

        this.game.play(x, y);

        let tree = this.joseki;

        for (let i = 0; i < this.path.length; i++) {
            tree = tree[this.path[i]].childs;
        }

        let pos = SGF.arrayPositionToString([ax, ay]);
        let index = tree.findIndex(t => (t.props.B || t.props.W)!.toLowerCase() === pos);

        this.path.push(index);

        tree.forEach(t => console.log(t.props.B || t.props.W));
        this.fetchHeatmap();
        this.forceUpdate();
    }

    render() {
        let isLandscape = window.innerWidth > window.innerHeight;
        let width = isLandscape ? (window.innerHeight / window.innerWidth * 100 - 7.5) : 100;
        let tm = ThemeManager.default;

        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <div style={{ width: `${width}%`, height: '100%', margin: 'auto', marginTop: -8, }}>
                    <div style={{ position: 'relative' }}>
                        <Board
                            id='board'
                            style={{ background: 'transparent', padding: 15, gridColor: tm.gridLineColor, blackStoneColor: tm.blackStoneColor, whiteStoneColor: tm.whiteStoneColor, coordTextColor: tm.coordTextColor, starPointColor: tm.starPointColor, winrateColor: tm.winrateColor }}
                            size={this.game.size}
                            states={this.game.board}
                            disabled={false}
                            onIntersectionClicked={(row, col) => this.onStonePlaced(row, col)}
                            showCoordinate={window.innerWidth >= 640}
                            highlightCoord={this.game.currentCartesianCoord}
                            heatmap={this.state.heatmap}
                            fontSize={window.innerWidth < 576 ? 7 : 10}
                            currentColor={this.game.currentColor} />
                    </div>
                </div>
            </div>
        );
    }
}