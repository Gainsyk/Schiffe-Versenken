import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GameScreenComponent} from './game-screen/game-screen.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'schiffe-versenken';
}
