import { Component } from '@angular/core';
import {CellComponent} from './cell/cell.component';
import {NgForOf} from '@angular/common';
import {Cell} from '../../models/cell.model';


@Component({
  selector: 'app-game-board',
  imports: [CellComponent, NgForOf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {
  cells: Cell[] = Array.from({length: 100}, () => ({cellState: 'fog'}));
}
