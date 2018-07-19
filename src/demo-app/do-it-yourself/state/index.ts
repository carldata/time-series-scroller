import { IHpTimeSeriesChartState } from "../../../hp-time-series-chart/state";

export interface IChartsState {
  voltageChartState: IHpTimeSeriesChartState;
  waterflowChartState: IHpTimeSeriesChartState;
  rainfallChartState: IHpTimeSeriesChartState;
  anomaliesChartState: IHpTimeSeriesChartState;
  dateRangeUnixFrom: number;
  dateRangeUnixTo: number;
} 

export interface IAppState {
  chartsState: IChartsState
}