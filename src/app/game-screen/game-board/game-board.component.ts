import {Component} from '@angular/core';
import {CellComponent} from './cell/cell.component';
import {NgForOf} from '@angular/common';
import {Cell} from '../../models/cell.model';
import {Orientation} from '../../models/vessel.model';


@Component({
  selector: 'app-game-board',
  imports: [CellComponent, NgForOf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {
  cells: Cell[] = Array.from({length: 100}, () => ({cellState: 'water'}));
  boardSize: number = 10;
  vesselClasses: number[] = [5, 4, 4, 3, 3, 3, 2, 2];
  currentVesselSections: number[] = [];
  currentVesselIndex: number = 0;
  orientation: Orientation = undefined;

  onCellClick(cellIndex: number): void {
    // falls alle Schiffe platziert, abbruch
    if (this.currentVesselIndex === this.vesselClasses.length) return;

    //Erstes Segment
    if (this.currentVesselSections.length === 0) {
      this.currentVesselSections.push(cellIndex);
      return;
    }

    //Jedes weitere Segment
    if (this.currentVesselSections.length === 1) {
      const firstIndex: number = this.currentVesselSections[0];
      const {row: firstRow, col: firstCol} = this.getRowCol(firstIndex);
      const {row: currentRow, col: currentCol} = this.getRowCol(cellIndex);

      if ((Math.abs(firstRow - currentRow) === 1 && firstCol === currentCol) ||
        (Math.abs(firstCol - currentCol) === 1 && firstRow === currentRow)) {
        this.currentVesselSections.push(cellIndex);
        this.orientation = (firstRow === currentRow) ? 'horizontal' : 'vertical';
      } else {
        alert('Schiffssegmente können nur anliegend in der Horizontalen oder Vertikalen angeordnet werden');
        return;
      }
    }
    if (this.isAdjacent(cellIndex)) {
      this.currentVesselSections.push(cellIndex);
    }
  }

  getRowCol(index: number): { row: number, col: number } {
    return {
      row: Math.floor(index / this.boardSize),
      col: index % this.boardSize
    };
  }

  isAdjacent(newIndex: number): boolean {
    const firstIndex: number = this.currentVesselSections[0];
    const currentIndex: number = this.currentVesselSections[this.currentVesselSections.length - 1];

    const {row: firstRow, col: firstCol} = this.getRowCol(firstIndex);
    const {row: lastRow, col: lastCol} = this.getRowCol(currentIndex);
    const {row: newRow, col: newCol} = this.getRowCol(newIndex);

    if (this.orientation === 'horizontal' && newRow === lastRow &&
      (Math.abs(newCol - lastCol) === 1 || Math.abs(newCol - firstCol) === 1)) {
      return true;
    }
    if (this.orientation === 'vertical' && newCol === lastCol &&
      (Math.abs(newRow - lastRow) === 1 || Math.abs(newRow - firstRow) === 1)) {
      return true;
    }
    return false;
  }

  resetVesselPlacement(): void {
    this.currentVesselSections = [];
    this.orientation = undefined;
    for (let cell of this.cells) {
      cell.cellState = 'water';
    }
  }
}
