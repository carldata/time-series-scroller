import { hpTimeSeriesChartCalculations } from './calculations';
import { IHpSliderHandleValues } from '../hp-slider/interfaces';
import { IHpTimeSeriesChartState } from './state';

const calculateSliderHandleValues = (state: IHpTimeSeriesChartState): IHpSliderHandleValues<number> => {
  return {
    left: hpTimeSeriesChartCalculations.translateDateTimeToSecondsDomain(state, state.windowDateFrom), 
    right: hpTimeSeriesChartCalculations.translateDateTimeToSecondsDomain(state, state.windowDateTo)
  };
}

export const hpSliderHpTimeSeriesChartIntegration = {
  calculateSliderHandleValues
}