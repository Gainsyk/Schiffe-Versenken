import {Component, effect, signal} from '@angular/core';
import {CellComponent} from './cell/cell.component';
import {NgForOf} from '@angular/common';
import {Cell, CellState} from '../../models/cell.model';
import {Coordinate} from '../../models/coordinate.model';
import {Orientation} from '../../models/vessel.model';

@Component({
  selector: 'app-game-board',
  imports: [CellComponent, NgForOf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})
export class GameBoardComponent {
  readonly startingState: CellState = 'fog';
  readonly boardSize: number = 10;
  cells: Cell[][] = [];
  vesselClasses: number[] = [5, 4, 4, 3, 3, 3, 2, 2];
  currentVesselSections: Coordinate[] = [];
  currentVesselIndex: number = 0;
  orientation: Orientation = undefined;
  cellClickedSig = signal<Coordinate | null>(null);

  ngOnInit(): void {
    for (let row = 0; row < this.boardSize; row++) {
      this.cells[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        this.cells[row][col] = {cellState: this.startingState};
      }
    }

    effect(() => {
      const coordinate = this.cellClickedSig();
      if(coordinate){
        this.placeVessels(coordinate);
        this.cellClickedSig.set(null);
      }
    });
  }

  placeVessels(coordinate: Coordinate): void {
    // falls alle Schiffe platziert, abbruch
    if (this.areAllVesselsSet()) return;

    //Erstes Segment
    if (this.hasNoSegmentsYet()) {
      this.currentVesselSections.push(coordinate);
      return;
    }

    //Jedes weitere Segment
    if (this.hasSegmentAlready()) {
      if (this.isAdjacent(coordinate)) {
        this.currentVesselSections.push(coordinate);
      } else {
        alert('Schiffssegmente können nur anliegend in der Horizontalen oder Vertikalen angeordnet werden');
        return;
      }
    }

    this.resetVesselTracker();

  }

  isAdjacent(newCoordinate: Coordinate): boolean {
    const lastCoordinate: Coordinate = this.currentVesselSections[this.currentVesselSections.length - 1];
    const firstCoordinate: Coordinate = this.currentVesselSections[0];

    //Orientierung setzen beim zweiten Segment
    if (this.isOnlyOneSegmentSet()) {
      if (this.isSameRow(firstCoordinate, newCoordinate) || this.isSameCol(firstCoordinate, newCoordinate)) {
        this.orientation = (firstCoordinate.row === newCoordinate.row) ? 'horizontal' : 'vertical';
      }
    }

    //Zelle auf Anschluss prüfen
    if (this.isValidHorizontalExtension(firstCoordinate, lastCoordinate, newCoordinate)) {
      return true;
    }
    if (this.isValidVerticalExtension(firstCoordinate, lastCoordinate, newCoordinate)) {
      return true;
    }
    return false;

  }

  private isSameRow(firstCoordinate: Coordinate, newCoordinate: Coordinate) {
    return Math.abs(firstCoordinate.col - newCoordinate.col) === 1 && firstCoordinate.row === newCoordinate.row;
  }

  private isSameCol(firstCoordinate: Coordinate, newCoordinate: Coordinate) {
    return Math.abs(firstCoordinate.row - newCoordinate.row) === 1 && firstCoordinate.col === newCoordinate.col;
  }

  private isValidVerticalExtension(firstCoordinate: Coordinate, lastCoordinate: Coordinate, newCoordinate: Coordinate) {
    return this.orientation === 'vertical' && newCoordinate.col === lastCoordinate.col &&
      (Math.abs(newCoordinate.row - firstCoordinate.row) === 1 || Math.abs(newCoordinate.row - lastCoordinate.row) === 1);
  }

  private isValidHorizontalExtension(firstCoordinate: Coordinate, lastCoordinate: Coordinate, newCoordinate: Coordinate) {
    return this.orientation === 'horizontal' && newCoordinate.row === lastCoordinate.row &&
      (Math.abs(newCoordinate.col - firstCoordinate.col) === 1 || Math.abs(newCoordinate.col - lastCoordinate.col) === 1);
  }

  private isOnlyOneSegmentSet() {
    return this.currentVesselSections.length === 1;
  }

  resetGame(): void {
    this.currentVesselSections = [];
    for (let row of this.cells) {
      for (let cell of row) {
        cell.cellState = this.startingState;
      }
    }
  }

  private hasSegmentAlready() {
    return this.currentVesselSections.length > 0;
  }

  private resetVesselTracker() {
    if (this.currentVesselSections.length === this.vesselClasses[this.currentVesselIndex]) {
      this.currentVesselSections = [];
      this.currentVesselIndex++;
    }
  }

  private areAllVesselsSet() {
    return this.currentVesselIndex === this.vesselClasses.length;
  }

  private hasNoSegmentsYet() {
    return this.currentVesselSections.length === 0;
  }
}
