import {Component} from '@angular/core';
import {GameScreenComponent} from './game-screen/game-screen.component';

@Component({
  selector: 'app-root',
  imports: [GameScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'schiffe-versenken';
}
