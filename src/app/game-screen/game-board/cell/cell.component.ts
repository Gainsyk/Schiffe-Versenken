import { Component } from '@angular/core';
import {NgClass} from '@angular/common';

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
cellState: 'ship' | 'fog' | 'water' | 'hit' | 'sunk' = 'fog';

  onCellClick() {

  }
}
