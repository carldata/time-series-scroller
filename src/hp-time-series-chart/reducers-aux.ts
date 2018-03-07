import * as _ from "lodash";
import * as dateFns from "date-fns";
import { IChartZoomSettings } from "./state/chart-zoom-settings";
import { EnumZoomSelected } from "./state/enums";
import { IUnixTimePoint } from "./state/unix-time-point";
import { IHpTimeSeriesChartState } from "./state";
import { IHpTimeSeriesChartTimeSeries } from "./state/time-series";

const SAMPLE_VALUE_MAX = 150;
const SECONDS_PER_SAMPLE = 60;

const buildInitialState = ():IHpTimeSeriesChartState => {
  let currentDate = new Date();
  let result: IHpTimeSeriesChartState = <IHpTimeSeriesChartState>{
    chartZoomSettings: <IChartZoomSettings>{
      zoomSelected: EnumZoomSelected.NoZoom
    },
    series: [<IHpTimeSeriesChartTimeSeries>{
      name: "red",
      color: "red",
      points: [],
      unixToIndexMap: new Map(),
      unixFrom: currentDate.getTime(),
      unixTo: currentDate.getTime(),
    }],
    dateRangeUnixFrom: currentDate.getTime(),
    dateRangeUnixTo: dateFns.addHours(currentDate, 6).getTime(),
    isDataLoading: false,
    windowUnixFrom: currentDate.getTime(),
    windowUnixTo: dateFns.addHours(currentDate, 6).getTime(),
    yMin: 0,
    yMax: 0
  };
  return result;
}

/**
 * For testing purposes only
 */
const randomContinousUnixTimePoints = (dateRangeDateFrom: Date, dateRangeDateTo: Date): IUnixTimePoint[] => {
  let referenceDate = new Date(dateRangeDateFrom.getTime());
  let result = [];
  let currentValue = _.random(50, 100);
  let iterationIndex = 0;
  while (dateFns.isBefore(referenceDate, dateRangeDateTo)) {
    result.push(<IUnixTimePoint>{ 
      unix: referenceDate.getTime(), 
      value: currentValue
    });
    referenceDate = dateFns.addSeconds(referenceDate, _.random(1, 5) * SECONDS_PER_SAMPLE);
    let chanceForChangeIndexValue = _.random(0, 100);
    if (_.inRange(chanceForChangeIndexValue, 0, 10)) {
      currentValue += 40 - _.random(0, 80);
    }
    if (_.inRange(chanceForChangeIndexValue, 10, 30)) {
      currentValue += 20 - _.random(0, 40);
    }
    iterationIndex++;
  }
  return result;
};

/**
 * For testing purposes only
 */
const randomIntermittentUnixTimePoints = (dateRangeDateFrom: Date, dateRangeDateTo: Date): IUnixTimePoint[] => {
  let result = [];
  let holeCounter = 0;
  for (let p of  randomContinousUnixTimePoints(dateRangeDateFrom, dateRangeDateTo)) {
    if ((holeCounter == 0) && (1 <= _.random(0, 11)))
      holeCounter = _.random(5, 25);
    (holeCounter > 0) ? holeCounter-- : result.push(p);
  }
  return result;
};

/**
 * For testing purposes only
 */
const squareWaveTimePoints = (dateRangeDateFrom: Date, dateRangeDateTo: Date): IUnixTimePoint[] => {
  let referenceDate = new Date(dateRangeDateFrom.getTime());
  let result = [];
  let iterationIndex = 0;
  while (dateFns.isBefore(referenceDate, dateRangeDateTo)) {
    result.push(<IUnixTimePoint>{ 
      unix: referenceDate.getTime(), 
      value: dateFns.getHours(referenceDate.getTime()) % 2 ? 1 : 0
    });
    referenceDate = dateFns.addSeconds(referenceDate, SECONDS_PER_SAMPLE);
    iterationIndex++;
    if (iterationIndex % 50000 == 0) {
      console.log(`Generated for ${dateFns.format(referenceDate, "YYYY-MM-DD HH:mm")}`);
    }
  }
  return result;
};

export const hpTimeSeriesChartReducerAuxFunctions = {
  buildInitialState,
  randomContinousUnixTimePoints,
  randomIntermittentUnixTimePoints,
  squareWaveTimePoints
} 