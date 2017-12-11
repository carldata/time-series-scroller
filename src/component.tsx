import { EnumHandleType } from './hp-slider/enums';
import { hpSliderHpTimeSeriesChartIntegration } from './hp-time-series-chart/hp-slider-integration';
import { hpTimeSeriesChartCalculations } from './hp-time-series-chart/calculations';
import { IChartDimensions } from './hp-time-series-chart/interfaces';
import { IHpTimeSeriesChartState } from './hp-time-series-chart/state';
import { HpSlider } from './hp-slider';
import { HpTimeSeriesChart } from './hp-time-series-chart';
import * as React from 'react';
import * as _ from 'lodash';

export interface IHpTimeSeriesScrollerProps {
  state: IHpTimeSeriesChartState;
  chartDimensions: IChartDimensions;
  /**
   * If not set, component just accepts TimeSeries (passed in the "state" property) and just manages on its' own.
   * If set, the component is connected to redux store / should invoke an action creator function.
   */
  setWindowDateFromTo?: (dateFrom: Date, dateTo: Date) => void
}

export interface IHpTimeSeriesScrollerState extends IHpTimeSeriesChartState {
}

export class HpTimeSeriesScroller extends React.Component<IHpTimeSeriesScrollerProps, IHpTimeSeriesScrollerState> {
  constructor(props: IHpTimeSeriesScrollerProps) {
    super(props);
    this.state = _.extend({}, props.state);
  }

  componentWillReceiveProps(nextProps: Readonly<IHpTimeSeriesScrollerProps>, nextContext: any) {
    this.setState(_.extend({}, nextProps.state));
  }

  public render() {
    return (
      <span>
        <HpTimeSeriesChart
          chartDimensions={this.props.chartDimensions}
          state={this.state}
        />
        <br />
        <HpSlider
          domain={{ domainMin: 0, domainMax: hpTimeSeriesChartCalculations.calculateDomainLengthMinutes(this.state) }}
          handleValues={hpSliderHpTimeSeriesChartIntegration.calculateSliderHandleValues(this.state)}
          dimensions={{
            sliderHandleWidthThicknessPx: 15,
            sliderHeightPx: 80,
            sliderWidthPx: this.props.chartDimensions.canvasWidth
          }}
          displayDragBar={true}
          handleMoved={(value: number | number[], type: EnumHandleType) => {
            let handleValues = hpSliderHpTimeSeriesChartIntegration.calculateSliderHandleValues(this.state);
            let newDateFrom = hpTimeSeriesChartCalculations.translateUnixMinutesDomainToDateTime(this.state, handleValues.left);
            let newDateTo = hpTimeSeriesChartCalculations.translateUnixMinutesDomainToDateTime(this.state, handleValues.right);
            switch (type) {
              case EnumHandleType.Left:
                newDateFrom = hpTimeSeriesChartCalculations.translateUnixMinutesDomainToDateTime(this.state, _.isNumber(value) ? value : 0);
                break;
              case EnumHandleType.Right:
                newDateTo = hpTimeSeriesChartCalculations.translateUnixMinutesDomainToDateTime(this.state, _.isNumber(value) ? value : 0);
                break;
              case EnumHandleType.DragBar:
                newDateFrom = hpTimeSeriesChartCalculations.translateUnixMinutesDomainToDateTime(this.state, value[0]);
                newDateTo = hpTimeSeriesChartCalculations.translateUnixMinutesDomainToDateTime(this.state, value[1]);
                break;
            }
            _.isFunction(this.props.setWindowDateFromTo) ?
              this.props.setWindowDateFromTo(newDateFrom, newDateTo) :
              this.setState({
                windowDateFrom: newDateFrom,
                windowDateTo: newDateTo
              });
          }}
        />
      </span>
    );
  }
}
