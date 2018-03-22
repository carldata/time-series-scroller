/**
 * Declares default reducer function implementations
 * that can be reused by a concrete screen reducer
 */
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as actionTypes from './action-types';
import { hpTimeSeriesChartCalculations as c } from './calculations';
import { IHpTimeSeriesChartState } from './state';
import { IUnixTimePoint } from './state/unix-time-point';
import { EnumTimeSeriesType } from './state/enums';
import { unixIndexMapCalculations } from './calculations/unix-index-map';
import { hpTimeSeriesChartReducerAuxFunctions as auxFunctions, hpTimeSeriesChartReducerAuxFunctions } from './reducers-aux';
import { IExternalSourceTimeSeries, IHpTimeSeriesChartTimeSeries } from './state/time-series';
import { SetDataAction, GenerateRandomDataAction } from './actions';

const initialState = hpTimeSeriesChartReducerAuxFunctions.buildInitialState();

/**
 * Builds (initial) chart state with several outer settings
 */
const generateRandomData = (state: IHpTimeSeriesChartState, action: GenerateRandomDataAction): IHpTimeSeriesChartState =>
  setData(state, new SetDataAction([{
    color: "orange",
    name: "Random Series",
    points: auxFunctions.randomContinousUnixTimePoints(action.from, action.to),
    type: EnumTimeSeriesType.Line,
  }]));

const setData = (state: IHpTimeSeriesChartState, action: SetDataAction): IHpTimeSeriesChartState => {
  const stateWithSeries = <IHpTimeSeriesChartState> {
    series: _.map<IExternalSourceTimeSeries, IHpTimeSeriesChartTimeSeries>(
      action.series,
      (el: IExternalSourceTimeSeries) => <IHpTimeSeriesChartTimeSeries> {
        color: el.color,
        unixFrom: _.isEmpty(el.points) ? Number.MAX_VALUE : _.first(el.points).unix,
        unixTo: _.isEmpty(el.points) ? Number.MIN_VALUE : _.last(el.points).unix,
        points: el.points,
        name: el.name,
        type: el.type,
        unixToIndexMap: unixIndexMapCalculations.createUnixToIndexMap(el.points)
      })
  };
  const allValues: number[] = _.reduceRight<IHpTimeSeriesChartTimeSeries, number[]>(stateWithSeries.series, 
    (accumulator: number[], series: IHpTimeSeriesChartTimeSeries) =>
      _.concat(accumulator, _.map(series.points, el => el.value)), []);
  const unixFrom = _.min(_.concat(_.map(stateWithSeries.series, el => el.unixFrom)));
  const unixTo = _.max(_.concat(_.map(stateWithSeries.series, el => el.unixTo)));
  const stateWithUnixFromTo = _.extend(stateWithSeries, <IHpTimeSeriesChartState>{
    dateRangeUnixFrom: unixFrom,
    dateRangeUnixTo: unixTo,
    windowUnixFrom: unixFrom,
    windowUnixTo: unixTo,
    yMin: _.min(allValues),
    yMax: _.max(allValues)
  });
  return _.extend(stateWithSeries, stateWithUnixFromTo);
}

export type HpTimeSeriesChartReducerActionTypes = GenerateRandomDataAction|SetDataAction;

export const hpTimeSeriesChartReducer = (state: IHpTimeSeriesChartState = initialState, action: HpTimeSeriesChartReducerActionTypes): IHpTimeSeriesChartState => {
  switch (action.type) {
    case actionTypes.GENERATE_RANDOM_DATA:
      return generateRandomData(state, action);
    case actionTypes.SET_DATA:
      return setData(state, action);
  }
}