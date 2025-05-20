import {Component, Host, HOST_TAG_NAME, Input, Output} from '@angular/core';
import {NgClass} from '@angular/common';
import {Cell} from '../../../models/cell.model';
import {Coordinate} from '../../../models/coordinate.model';
import {GameBoardComponent} from '../game-board.component';

@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.css'
})
export class CellComponent {
  @Input() cell!: Cell;
  @Input() coordinate!: Coordinate;
  @Input() signalSet!: (coordinate: Coordinate) => void; // an das Signal-Objekt cellClickedSig gebundene funktion signal.set() aus board

  constructor(@Host() public board: GameBoardComponent) {
  }

  onCellClick(): void {
    this.signalSet(this.coordinate); // setzt das Signal aus Board auf zur Zelle gehörende Koordinate
  }
}
