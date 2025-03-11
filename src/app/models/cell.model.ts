export type CellState = 'ship' | 'fog' | 'water' | 'hit' | 'sunk';

export interface Cell {
  cellState: CellState;
}
