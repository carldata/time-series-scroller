import { hpTimeSeriesChartCalculations } from './calculations';
import { IHpSliderHandleValues } from '../hp-slider/interfaces';
import { IHpTimeSeriesChartState } from './state';

const calculateSliderHandleValues = (state: IHpTimeSeriesChartState): IHpSliderHandleValues<number> => {
  return {
    left: hpTimeSeriesChartCalculations.translateDateTimeToUnixSecondsDomain(state, state.windowDateFrom), 
    right: hpTimeSeriesChartCalculations.translateDateTimeToUnixSecondsDomain(state, state.windowDateTo)
  };
}

export const hpSliderHpTimeSeriesChartIntegration = {
  calculateSliderHandleValues
}