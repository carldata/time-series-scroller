import { EnumZoomSelected } from './enums';

export interface IChartZoomSettings {
  zoomSelected: EnumZoomSelected;
  totalNumberOfFrames: number;
  currentFrameNumber: number;
  zoomLevel1FramePointsUnixFrom: number;
  zoomLevel1FramePointsUnixTo: number;
  zoomLevel2FramePointsUnixFrom: number;
  zoomLevel2FramePointsUnixTo: number;
}