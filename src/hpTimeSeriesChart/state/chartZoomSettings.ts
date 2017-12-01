import { EnumZoomSelected } from './enums';

export interface IChartZoomSettings {
  zoomSelected: EnumZoomSelected;
  totalNumberOfFrames: number;
  currentFrameNumber: number;
  zoomLevel1FramePointsFrom: Date;
  zoomLevel1FramePointsTo: Date;
  zoomLevel2FramePointsFrom: Date;
  zoomLevel2FramePointsTo: Date;
}