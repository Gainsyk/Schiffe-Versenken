import { Component } from '@angular/core';
import {CellComponent} from './cell/cell.component';

@Component({
  selector: 'app-game-board',
  imports: [CellComponent],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {

}
