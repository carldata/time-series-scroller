import * as React from "react";
import { IHpSliderScssGeneric, IHpTimeSeriesChartScssGeneric } from "../sass/styles";
import { HpTimeSeriesScroller } from "./index";
import { hpTimeSeriesChartAuxiliary } from "../hp-time-series-chart/auxiliary";
import { IExternalSourceTimeSeries } from "../hp-time-series-chart/state/time-series";


export interface IHpTimeSeriesScrollerWrapperProps {
  series: IExternalSourceTimeSeries[];
  sliderScss: IHpSliderScssGeneric<number>;
  timeSeriesChartScss: IHpTimeSeriesChartScssGeneric<number>;
  displaySlider?: boolean;
}

/**
 * Wraps HpTimeSeriesScroller providing the façade usage;
 * properties are simplified as much as possible to facilitate setting them "manually"
 * (without using/calling reducers).
 * It is the recommended way to use the HpTimeSeriesScroller without Redux.
 */
export const HpTimeSeriesScrollerWrapper = (props: IHpTimeSeriesScrollerWrapperProps) => {
  return <HpTimeSeriesScroller 
    state={hpTimeSeriesChartAuxiliary.buildStateFromExternalSource(props.series)}
    sliderScss={props.sliderScss} 
    timeSeriesChartScss={props.timeSeriesChartScss}
    displaySlider={props.displaySlider} />
}