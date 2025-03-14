import {Component, Input} from '@angular/core';
import {NgClass} from '@angular/common';
import {Cell} from '../../../models/cell.model';

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

  //ARG: cellIndex: number
  onCellClick(): void {
    this.cell.cellState = 'water';
  }
}
