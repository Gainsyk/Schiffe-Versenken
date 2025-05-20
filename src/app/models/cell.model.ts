export type CellState = 'ship' | 'water' | 'hit' | 'sunk';

export interface Cell {
  cellState: CellState;
}
