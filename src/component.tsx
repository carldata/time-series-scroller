import { EnumZoomSelected } from './hp-time-series-chart/state/enums';
import * as dateFns from 'date-fns';
import { EnumHandleType } from './hp-slider/enums';
import { hpSliderHpTimeSeriesChartIntegration } from './hp-time-series-chart/hp-slider-integration';
import { hpTimeSeriesChartCalculations } from './hp-time-series-chart/calculations';
import { IChartDimensions } from './hp-time-series-chart/interfaces';
import { IHpTimeSeriesChartState } from './hp-time-series-chart/state';
import { HpSlider } from './hp-slider';
import { HpTimeSeriesChart } from './hp-time-series-chart';
import * as React from 'react';
import * as _ from 'lodash';
import { ButtonGroup, Button } from 'react-bootstrap';

export interface IHpTimeSeriesScrollerProps {
  state: IHpTimeSeriesChartState;
  chartDimensions: IChartDimensions;
  zoomWindowLevelSet?: (zoomLevel: EnumZoomSelected, dateFrom: Date, dateTo: Date) => void;
  displayZoomLevelButtons?: boolean;
}

export interface IHpTimeSeriesScrollerState extends IHpTimeSeriesChartState { }

export class HpTimeSeriesScroller extends React.Component<IHpTimeSeriesScrollerProps, IHpTimeSeriesScrollerState> {
  constructor(props: IHpTimeSeriesScrollerProps) {
    super(props);
    this.state = _.extend({}, props.state);
  }

  componentWillReceiveProps(nextProps: Readonly<IHpTimeSeriesScrollerProps>, nextContext: any) {
    this.setState(_.extend({}, nextProps.state));
  }

  private getZoomButtonStyle = (stateMode: EnumZoomSelected, expectedMode: EnumZoomSelected): string => {
    return stateMode == expectedMode ? "success" : "default";
  }

  private isZoomButtonDisabled = (zoomLimitationLevelButtonIsPresenting: EnumZoomSelected, currentZoomLimitationLevel: EnumZoomSelected): boolean => {
    return Math.abs(zoomLimitationLevelButtonIsPresenting - currentZoomLimitationLevel) > 1;
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
          domain={{ domainMin: 0, domainMax: hpTimeSeriesChartCalculations.calculateDomainLengthSeconds(this.state) }}
          handleValues={hpSliderHpTimeSeriesChartIntegration.calculateSliderHandleValues(this.state)}
          dimensions={{
            sliderHandleWidthThicknessPx: 15,
            sliderHeightPx: 80,
            sliderWidthPx: this.props.chartDimensions.canvasWidth
          }}
          displayDragBar={true}
          handleMoved={(value: number | number[], type: EnumHandleType) => {
            let handleValues = hpSliderHpTimeSeriesChartIntegration.calculateSliderHandleValues(this.state);
            let newDateFrom = hpTimeSeriesChartCalculations.translateUnixSecondsDomainToDateTime(this.state, handleValues.left);
            let newDateTo = hpTimeSeriesChartCalculations.translateUnixSecondsDomainToDateTime(this.state, handleValues.right);
            switch (type) {
              case EnumHandleType.Left:
                newDateFrom = hpTimeSeriesChartCalculations.translateUnixSecondsDomainToDateTime(this.state, _.isNumber(value) ? value : 0);
                break;
              case EnumHandleType.Right:
                newDateTo = hpTimeSeriesChartCalculations.translateUnixSecondsDomainToDateTime(this.state, _.isNumber(value) ? value : 0);
                break;
              case EnumHandleType.DragBar:
                newDateFrom = hpTimeSeriesChartCalculations.translateUnixSecondsDomainToDateTime(this.state, value[0]);
                newDateTo = hpTimeSeriesChartCalculations.translateUnixSecondsDomainToDateTime(this.state, value[1]);
                break;
            }
            this.setState({
              windowDateFrom: newDateFrom,
              windowDateTo: newDateTo
            })
          }}
        />
        <br />
        {_.isBoolean(this.props.displayZoomLevelButtons) && this.props.displayZoomLevelButtons &&
          <ButtonGroup>
            <Button
              type="button"
              disabled={this.isZoomButtonDisabled(EnumZoomSelected.NoZoom, this.state.chartZoomSettings.zoomSelected)} 
              bsSize="xs"
              onMouseUp={(e) => this.props.zoomWindowLevelSet(EnumZoomSelected.NoZoom, this.state.windowDateFrom, this.state.windowDateTo) } 
              bsStyle={this.getZoomButtonStyle(this.state.chartZoomSettings.zoomSelected, EnumZoomSelected.NoZoom)}>
              View All
            </Button>
            <Button 
              type="button"
              disabled={this.isZoomButtonDisabled(EnumZoomSelected.ZoomLevel1, this.state.chartZoomSettings.zoomSelected)}
              bsSize="xs" 
              onMouseUp={() => this.props.zoomWindowLevelSet(EnumZoomSelected.ZoomLevel1, this.state.windowDateFrom, this.state.windowDateTo) } 
              bsStyle={this.getZoomButtonStyle(this.state.chartZoomSettings.zoomSelected, EnumZoomSelected.ZoomLevel1)}>
              1
            </Button>
            <Button 
              type="button"
              disabled={this.isZoomButtonDisabled(EnumZoomSelected.ZoomLevel2, this.state.chartZoomSettings.zoomSelected)}
              bsSize="xs" 
              onMouseUp={() => this.props.zoomWindowLevelSet(EnumZoomSelected.ZoomLevel2, this.state.windowDateFrom, this.state.windowDateTo) } 
              bsStyle={this.getZoomButtonStyle(this.state.chartZoomSettings.zoomSelected, EnumZoomSelected.ZoomLevel2)}>
              2
            </Button>
          </ButtonGroup>
        }
      </span>
    );
  }
}
