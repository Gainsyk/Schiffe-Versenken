import {Component, signal, WritableSignal} from '@angular/core';
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
  player1Victories: WritableSignal<number> = signal(0);
  player2Victories: WritableSignal<number> = signal(0);

  onPlayer1Defeat() {
    this.player2Victories.update((n) => n + 1);
  }

  onPlayer2Defeat() {
    this.player1Victories.update((n) => n + 1);
  }

}
