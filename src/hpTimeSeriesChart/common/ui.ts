import * as moment from 'Moment';
import * as _ from 'lodash';
import { IZoomCacheElementDescription, IPluginFunctions } from './interfaces';
import { EnumZoomSelected } from '../models/enums';
import { IChartState } from '../models/chartState';

interface ITimePeriod {
  minimalHours: number;
  maximalHours: number;
  caption: string;
}

/**
 * Pre defined periods as people understand it
 */
const preDefinedPeriodDescriptions = [
  <ITimePeriod>{ minimalHours: -1, maximalHours: 24, caption: "hours" },
  <ITimePeriod>{ minimalHours: 24, maximalHours: 24*7, caption: "days" },
  <ITimePeriod>{ minimalHours: 24*7, maximalHours: 24*7*4, caption: "weeks" },
  <ITimePeriod>{ minimalHours: 24*7*4, maximalHours: 24*7*4*3, caption: "months" },
  <ITimePeriod>{ minimalHours: 24*7*4*3, maximalHours: 24*7*4*12, caption: "quarters" },
  <ITimePeriod>{ minimalHours: 24*7*4*12, maximalHours: Number.MAX_VALUE, caption: "years" },
]

export const getZoomLevelButtonCaption = (buttonZoomLevel: EnumZoomSelected, state: IChartState): string => {
  let result = "";
  let windowDifferenceHours = state.windowDateTo.clone().diff(state.windowDateFrom, "hours");
  let windowPreDefinedPeriodDescription: ITimePeriod = _.find(preDefinedPeriodDescriptions, el => windowDifferenceHours >= el.minimalHours && windowDifferenceHours < el.maximalHours);
  
  let zoomLevelDifferenceHours = 0;
  let zoomLevelPeriodDescription: ITimePeriod = null;
  switch (state.chartZoomSettings.zoomSelected) {
    case EnumZoomSelected.ZoomLevel1:
      zoomLevelDifferenceHours = state.chartZoomSettings.zoomLevel1FramePointsTo.clone().diff(state.chartZoomSettings.zoomLevel1FramePointsFrom, "hours");
      zoomLevelPeriodDescription = _.find(preDefinedPeriodDescriptions, el => zoomLevelDifferenceHours >= el.minimalHours && zoomLevelDifferenceHours < el.maximalHours);
      break;
    case EnumZoomSelected.ZoomLevel2:
      zoomLevelDifferenceHours = state.chartZoomSettings.zoomLevel2FramePointsTo.clone().diff(state.chartZoomSettings.zoomLevel2FramePointsFrom, "hours");
      zoomLevelPeriodDescription = _.find(preDefinedPeriodDescriptions, el => zoomLevelDifferenceHours >= el.minimalHours && zoomLevelDifferenceHours < el.maximalHours);
      break;
  }
  
  switch (buttonZoomLevel) {
    case EnumZoomSelected.NoZoom:
      result = "All";
      break;
    case EnumZoomSelected.ZoomLevel1:
      result = _.isObject(zoomLevelPeriodDescription) ? `Zoom Level 1 - ${zoomLevelPeriodDescription.caption}` :  "Zoom Level 1";
      if (state.chartZoomSettings.zoomSelected == EnumZoomSelected.NoZoom) {
        result = `Zoom Level 1 - ${windowPreDefinedPeriodDescription.caption}`;
      }
      break;
    case EnumZoomSelected.ZoomLevel2:
      result = _.isObject(zoomLevelPeriodDescription) ? `Zoom Level 2 - ${zoomLevelPeriodDescription.caption}` :  "Zoom Level 2";
      if (state.chartZoomSettings.zoomSelected == EnumZoomSelected.ZoomLevel1) {
        result = `Zoom Level 2 - ${windowPreDefinedPeriodDescription.caption}`;
      }
      break;
  }
  return result;
}