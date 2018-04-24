import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IHpTimeSeriesChartState } from  '../../hp-time-series-chart/state';
import { hpTimeSeriesChartReducer } from '../../hp-time-series-chart/reducers';
import { GenerateRandomSeriesDataAction } from './actions';
import { ReceivedCsvChunkAction, FinishedProcessingCsvAction, StartedProcessingCsvAction } from '../../hp-time-series-chart/csv-loading/actions';
import { SetDataAction } from '../../hp-time-series-chart/actions';
import { IExternalSourceTimeSeries } from '../../hp-time-series-chart/state/time-series';
import { hpTimeSeriesChartReducerAuxFunctions } from '../../hp-time-series-chart/reducers-aux';
import { EnumTimeSeriesType } from '../../hp-time-series-chart/state/enums';
import { GENERATE_RANDOM_SERIES } from './action-types';
import { csvLoadingAuxiliary } from '../../hp-time-series-chart/csv-loading/auxiliary';
import { EnumRawCsvFormat } from '../../hp-time-series-chart/csv-loading/calculations';
import { IUnixTimePoint } from '../../index';
import { IChartsState } from './state';

export type DoItYourselfContainerReducerActionTypes = GenerateRandomSeriesDataAction;

const state = {
  rainfallChartState: hpTimeSeriesChartReducerAuxFunctions.buildInitialState(),
  waterflowChartState: hpTimeSeriesChartReducerAuxFunctions.buildInitialState(),
  voltageChartState: hpTimeSeriesChartReducerAuxFunctions.buildInitialState(),
}

const initialState: IChartsState = {
  ...state,
  dateRangeUnixFrom: state.voltageChartState.dateRangeUnixFrom,
  dateRangeUnixTo: state.voltageChartState.dateRangeUnixTo,
};

const VOLTAGE_SECONDS_PER_SAMPLE = 360;

const randomVoltage = (baseValueVolts: number): number => baseValueVolts + (100 - _.random(0, 200))/1000;

const randomVoltageSeries = (dateFrom: Date, dateTo: Date): IUnixTimePoint[] => {
  dateFrom = dateFns.addDays(dateFrom, 3);
  dateTo = dateFns.addDays(dateTo, 3);
  let referenceDate = new Date(dateFrom.getTime());
  let result = [];
  let baseValueVolts = 12;
  while (dateFns.isBefore(referenceDate, dateTo)) {
    result.push(<IUnixTimePoint>{ 
      unix: referenceDate.getTime(), 
      value: randomVoltage(baseValueVolts)
    });
    referenceDate = dateFns.addSeconds(referenceDate, _.random(1, 5) * VOLTAGE_SECONDS_PER_SAMPLE);
    let chanceForChangeBaseVoltage = _.random(0, 100);
    if (_.inRange(chanceForChangeBaseVoltage, 0, 2)) {
      baseValueVolts = (baseValueVolts === 12) ? 1 : 12;
    }
  }
  return result;
};

const rainfallSeries = (dateFrom: Date, dateTo: Date): IUnixTimePoint[] => {
  dateFrom = dateFns.addDays(dateFrom, -4);
  dateTo = dateFns.addDays(dateTo, 4);
  let referenceDate = new Date(dateFrom.getTime());
  let result = [];
  let rainAccumulationLeft = 0;
  let sample = 0;
  while (dateFns.isBefore(referenceDate, dateTo)) {
    result.push(<IUnixTimePoint>{ 
      unix: referenceDate.getTime(), 
      value: sample
    });
    referenceDate = dateFns.addMinutes(referenceDate, 5);
    if ((rainAccumulationLeft == 0) && (_.inRange(_.random(0, 1000), 0, 1))) {
      rainAccumulationLeft = _.random(50, 150);
    }
    if (rainAccumulationLeft > 0) {
      sample = _.random(1, 6);
      rainAccumulationLeft = (rainAccumulationLeft - sample) < 0 ? 0 : rainAccumulationLeft - sample;
    } else {
      sample = 0;
    }
  }
  return result;
};


export const doItYourselfContainerReducer = (state: IChartsState = initialState, action: DoItYourselfContainerReducerActionTypes): IChartsState => {
  switch (action.type) {
    case GENERATE_RANDOM_SERIES:
      const chartStates = {
        voltageChartState: hpTimeSeriesChartReducer(state.voltageChartState, new SetDataAction([
          <IExternalSourceTimeSeries> {
            color: 'red',
            name: 'Voltage',
            points: randomVoltageSeries(action.dateFrom, action.dateTo),
            type: EnumTimeSeriesType.Line
          }]
        )),
        rainfallChartState: hpTimeSeriesChartReducer(state.rainfallChartState, new SetDataAction([
          <IExternalSourceTimeSeries> {
            color: 'blue',
            name: 'Rainfall',
            points: rainfallSeries(action.dateFrom, action.dateTo),
            type: EnumTimeSeriesType.Line
          }])),
        waterflowChartState: hpTimeSeriesChartReducer(state.waterflowChartState, new SetDataAction([
          <IExternalSourceTimeSeries> {
            color: 'navy',
            name: 'Rainfall',
            points: hpTimeSeriesChartReducerAuxFunctions.randomContinousUnixTimePoints(action.dateFrom, action.dateTo),
            type: EnumTimeSeriesType.Line
          }])),
      } as IChartsState;
      const boundaryUnixFrom = _.min([chartStates.rainfallChartState.dateRangeUnixFrom,
                                      chartStates.voltageChartState.dateRangeUnixFrom,
                                      chartStates.waterflowChartState.dateRangeUnixFrom]);
      const boundaryUnixTo = _.max([chartStates.rainfallChartState.dateRangeUnixTo,
                                    chartStates.voltageChartState.dateRangeUnixTo,
                                    chartStates.waterflowChartState.dateRangeUnixTo]);
      return {
        voltageChartState: { ...chartStates.voltageChartState, windowUnixFrom: boundaryUnixFrom, windowUnixTo: boundaryUnixTo },
        rainfallChartState: { ...chartStates.rainfallChartState, windowUnixFrom: boundaryUnixFrom, windowUnixTo: boundaryUnixTo },
        waterflowChartState: { ...chartStates.waterflowChartState, windowUnixFrom: boundaryUnixFrom, windowUnixTo: boundaryUnixTo },
        dateRangeUnixFrom: boundaryUnixFrom,
        dateRangeUnixTo: boundaryUnixTo
      } as IChartsState;
    default:
      return state;
  }
}