import {Coordinate} from './coordinate.model';
import {MessageKey} from '../i18n/messages';

export type Orientation = 'horizontal' | 'vertical' | undefined;

export interface VesselPlacement {
  class: MessageKey,
  amountSections: number;
  placedSections: number;
  coordinatesOfSections: Coordinate[];
}
