import {Component, effect, Input, signal, OnInit, OnDestroy, WritableSignal, Output, EventEmitter} from '@angular/core';
import {CellComponent} from './cell/cell.component';
import {NgForOf, NgIf} from '@angular/common';
import {Cell, CellState} from '../../models/cell.model';
import {Coordinate} from '../../models/coordinate.model';
import {Orientation, VesselPlacement} from '../../models/vessel.model';
import {StatsScreenComponent} from '../stats-screen/stats-screen.component';
import {StatsService} from '../../services/stats.service';
import {getVesselMessage, MessageKey} from '../../i18n/messages';
import {GamePhase} from '../../models/game-phase.model';

@Component({
  selector: 'app-game-board',
  imports: [CellComponent, NgForOf, StatsScreenComponent, NgIf],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css',
  providers: [StatsService]
})

export class GameBoardComponent implements OnInit, OnDestroy {
  constructor(private stats: StatsService) {
    if(this.loser()) {
      this.stats.recordVictory();
    }
  }

  @Input() shouldMirrorStats: boolean = false;
  vesselClasses: { class: MessageKey, amountSections: number }[] = [
    // {class: 'carrier', amountSections: 5},
    // {class: 'battleship', amountSections: 4},
    // {class: 'cruiser', amountSections: 3},
    // {class: 'destroyer', amountSections: 2},
    {class: 'destroyer', amountSections: 2},
    {class: 'submarine', amountSections: 1}];
  readonly startingState: CellState = 'water';
  readonly boardSize: number = 10;
  cells: Cell[][] = [];
  vesselPlacements: VesselPlacement[] = [];
  orientation: Orientation = undefined;
  gamePhase: WritableSignal<GamePhase> = signal<GamePhase>('deployment');
  fogOfWar: WritableSignal<Set<string>> = signal<Set<string>>(new Set<string>);
  sitRep: WritableSignal<boolean> = signal<boolean>(false);
  loser: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit(): void {
    this.initBoard();
    this.initVesselPlacement();
    this.stats.countSections(this.vesselClasses);
    this.stats.startTimer();
  }

  ngOnDestroy() {
    this.stats.stopSubscription();
  }

  cellClickedSig: WritableSignal<Coordinate | null> = signal<Coordinate | null>(null);

  private readonly _effect = effect(() => {
    const coordinate = this.cellClickedSig();
    if (!coordinate) return;

    if (this.gamePhase() === 'deployment') {
      this.placeVessels(coordinate);
      if (this.areAllVesselsSet()) {
        this.gamePhase.set('battle');
        this.stats.setDeployed(this.vesselClasses.length);
        this.setFog();
      }

    } else {
      this.fireShots(coordinate);
    }

    this.cellClickedSig.set(null);
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
      coordinatesOfSections: [],
      sunk: false
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

  private fireShots(coordinate: Coordinate): void {
    this.stats.recordShot();
    this.clearFog(coordinate);
    const cell = this.cells[coordinate.row][coordinate.col];

    // bereits beschossen
    if (cell.cellState === 'hit' || cell.cellState === 'sunk') {
      return;
    }

    // Treffer
    if (cell.cellState === 'ship') {
      cell.cellState = 'hit';
      this.stats.recordHit();
      this.stats.subtractSection();
      const vp = this.vesselPlacements.find(vp =>
        vp.coordinatesOfSections.some(c => c.row === coordinate.row && c.col === coordinate.col))!;
      const isAllHit = vp.coordinatesOfSections.every(c => this.cells[c.row][c.col].cellState === 'hit');
      if (isAllHit) {
        vp.coordinatesOfSections.forEach(c => this.cells[c.row][c.col].cellState = 'sunk');
        this.stats.recordSunk();
        vp.sunk = true;
      }

    } else {
      cell.cellState = 'water';
      this.stats.recordMiss();
    }

    if (this.stats.getIntactSections() === 0) {
      this.loser.set(true);
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
      setTimeout(() => {
        alert(getVesselMessage(vp.class));
      }, 0);
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

  private clearFog(coordinate: Coordinate) {
    this.fogOfWar.update(oldSet => {
      const newSet = new Set<string>(oldSet);
      newSet.delete(`${coordinate.row},${coordinate.col}`);
      return newSet;
    })
  }

  private setFog() {
    const fogSet = new Set<string>();
    this.cells.forEach((row, rowIdx) =>
      row.forEach((cell, colIdx) => {
        fogSet.add(`${rowIdx},${colIdx}`);
      }))
    this.fogOfWar.set(fogSet);
  }

  closeJollyRoger() {
    this.loser.set(false);
  }
}
