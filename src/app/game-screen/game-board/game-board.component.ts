import { Component } from '@angular/core';
import {CellComponent} from './cell/cell.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-game-board',
  imports: [CellComponent, NgForOf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {
cells = Array(100).fill(0);
}
