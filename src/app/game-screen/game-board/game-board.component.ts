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
    if (this.areAllVesselsSet()) return;

    //Erstes Segment
    if (this.hasNoSegmentsYet()) {
      this.currentVesselSections.push(cellIndex);
      return;
    }

    //Jedes weitere Segment
    if (this.hasSegmentAlready()) {
      if (this.isAdjacent(cellIndex)) {
        this.currentVesselSections.push(cellIndex);
      } else {
        alert('Schiffssegmente können nur anliegend in der Horizontalen oder Vertikalen angeordnet werden');
        return;
      }
    }

    this.resetVesselTracker();
  }

  private resetVesselTracker() {
    if (this.currentVesselSections.length === this.vesselClasses[this.currentVesselIndex]) {
      this.currentVesselSections = [];
      this.currentVesselIndex++;
      this.orientation = undefined;
    }
  }

  getRowCol(index: number): { row: number, col: number } {
    return {
      row: Math.floor(index / this.boardSize),
      col: index % this.boardSize
    };
  }

  isAdjacent(newIndex: number): boolean {
    const lastIndex: number = this.currentVesselSections[this.currentVesselSections.length - 1];
    const firstIndex: number = this.currentVesselSections[0];

    const {row: firstRow, col: firstCol} = this.getRowCol(firstIndex);
    const {row: lastRow, col: lastCol} = this.getRowCol(lastIndex);
    const {row: newRow, col: newCol} = this.getRowCol(newIndex);

    //Orientierung setzen beim zweiten Segment
    if (this.isOnlyOneSegmentSet()) {
      if (this.isSameCol(firstRow, newRow, firstCol, newCol) || this.isSameRow(firstCol, newCol, firstRow, newRow)) {
        this.orientation = (firstRow === newRow) ? 'horizontal' : 'vertical';
      }
    }

    //Zelle auf Anschluss prüfen
    if (this.isValidHorizontalExtension(newRow, lastRow, newCol, lastCol, firstCol)) {
      return true;
    }
    if (this.isValidVerticalExtension(newCol, lastCol, newRow, lastRow, firstRow)) {
      return true;
    }
    return false;
  }

  private hasSegmentAlready() {
    return this.currentVesselSections.length > 0;
  }

  private hasNoSegmentsYet() {
    return this.currentVesselSections.length === 0;
  }

  private areAllVesselsSet() {
    return this.currentVesselIndex === this.vesselClasses.length;
  }

  private isOnlyOneSegmentSet() {
    return this.currentVesselSections.length === 1;
  }

  private isSameRow(firstCol: number, newCol: number, firstRow: number, newRow: number) {
    return Math.abs(firstCol - newCol) === 1 && firstRow === newRow;
  }

  private isSameCol(firstRow: number, newRow: number, firstCol: number, newCol: number) {
    return Math.abs(firstRow - newRow) === 1 && firstCol === newCol;
  }

  private isValidVerticalExtension(newCol: number, lastCol: number, newRow: number, lastRow: number, firstRow: number) {
    return this.orientation === 'vertical' && newCol === lastCol &&
      (Math.abs(newRow - lastRow) === 1 || Math.abs(newRow - firstRow) === 1);
  }

  private isValidHorizontalExtension(newRow: number, lastRow: number, newCol: number, lastCol: number, firstCol: number) {
    return this.orientation === 'horizontal' && newRow === lastRow &&
      (Math.abs(newCol - lastCol) === 1 || Math.abs(newCol - firstCol) === 1);
  }

  resetGame(): void {
    this.currentVesselSections = [];
    this.orientation = undefined;
    for (let cell of this.cells) {
      cell.cellState = 'water';
    }
  }
}
