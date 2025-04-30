import {Component, effect, Input, signal, OnInit, OnDestroy} from '@angular/core';
import {CellComponent} from './cell/cell.component';
import {NgForOf} from '@angular/common';
import {Cell, CellState} from '../../models/cell.model';
import {Coordinate} from '../../models/coordinate.model';
import {Orientation, VesselPlacement} from '../../models/vessel.model';
import {StatsScreenComponent} from '../stats-screen/stats-screen.component';
import {StatsService} from '../../services/stats.service';
import {getVesselMessage, MessageKey} from '../../i18n/messages';

@Component({
  selector: 'app-game-board',
  imports: [CellComponent, NgForOf, StatsScreenComponent],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css'
})

export class GameBoardComponent implements OnInit, OnDestroy {
  constructor(private stats: StatsService) {
  }

  @Input() shouldMirrorStats = false;
  vesselClasses: { class: MessageKey, amountSections: number }[] = [
    {class: 'carrier', amountSections: 5},
    {class: 'battleship', amountSections: 4},
    {class: 'cruiser', amountSections: 3},
    {class: 'cruiser', amountSections: 3},
    {class: 'destroyer', amountSections: 2},
    {class: 'destroyer', amountSections: 2},
    {class: 'submarine', amountSections: 1}];
  readonly startingState: CellState = 'water';
  readonly boardSize: number = 10;
  cells: Cell[][] = [];
  vesselPlacements: VesselPlacement[] = [];
  orientation: Orientation = undefined;

  ngOnInit(): void {
    this.initBoard();
    this.initVesselPlacement();
    this.stats.startTimer();
  }

  ngOnDestroy() {
    this.stats.stopSubscription();
  }

  cellClickedSig = signal<Coordinate | null>(null);

  private readonly _effect = effect(() => {
    const coordinate = this.cellClickedSig();
    if (coordinate) {
      this.placeVessels(coordinate);
      this.cellClickedSig.set(null);
    }
  });

  placeVessels(coordinate: Coordinate): void {
    // falls alle Schiffe platziert, Abbruch
    if (this.areAllVesselsSet()) {
      alert('All available assets are deployed');
      return;
    }

    // aktives Schiff holen
    const vp = this.getActiveVessel();

    //Erstes Segment
    if (this.hasNoSegmentsYet()) {
      this.addSection(vp, coordinate);
      return;
    }

    //Jedes weitere Segment
    if (this.hasSegmentAlready()) {
      if (this.isAdjacent(vp, coordinate)) {
        this.addSection(vp, coordinate);
      } else {
        alert('Ship segments may only be placed vertically or horizontally adjacent to each other');
        return;
      }
    }
  }

  isAdjacent(vp: VesselPlacement, newCoordinate: Coordinate): boolean {
    const firstCoordinate: Coordinate = vp.coordinatesOfSections[0];
    const lastCoordinate: Coordinate = vp.coordinatesOfSections[vp.coordinatesOfSections.length - 1];

    //Orientierung setzen beim zweiten Segment
    if (this.hasOnlyOneSegment()) {
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

  private initVesselPlacement() {
    this.vesselPlacements = this.vesselClasses.map(vc => ({
      class: vc.class,
      amountSections: vc.amountSections,
      placedSections: 0,
      coordinatesOfSections: []
    }));
  }

  private initBoard() {
    for (let row = 0; row < this.boardSize; row++) {
      this.cells[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        this.cells[row][col] = {cellState: this.startingState};
      }
    }
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

  resetGame(): void {
    this.stats.stopSubscription();
    this.stats.startTimer();
    this.orientation = undefined;
    this.initBoard();
    this.initVesselPlacement();
  }

  private addSection(vp: VesselPlacement, coordinate: Coordinate): void {
    this.cells[coordinate.row][coordinate.col].cellState = 'ship';

    vp.coordinatesOfSections.push(coordinate);
    vp.placedSections = vp.coordinatesOfSections.length;

    if (vp.placedSections === vp.amountSections) {
      alert(getVesselMessage(vp.class));
    }
  }

  private getActiveVessel(): VesselPlacement {
    return this.vesselPlacements.find(vp => vp.placedSections < vp.amountSections)!;
  }

  private hasNoSegmentsYet(): boolean {
    return this.getActiveVessel().placedSections === 0;
  }

  private hasSegmentAlready(): boolean {
    return this.getActiveVessel().placedSections > 0;
  }

  private hasOnlyOneSegment(): boolean {
    return this.getActiveVessel().placedSections === 1;
  }

  private areAllVesselsSet(): boolean {
    return this.vesselPlacements.every(vp => vp.placedSections === vp.amountSections);
  }
}
