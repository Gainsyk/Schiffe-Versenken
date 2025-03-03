import { Component } from '@angular/core';
import {GameBoardComponent} from './game-board/game-board.component';

@Component({
  selector: 'app-game-screen',
  imports: [
    GameBoardComponent
  ],
  templateUrl: './game-screen.component.html',
  styleUrl: './game-screen.component.css'
})
export class GameScreenComponent {

}
