import * as _ from 'lodash';
import * as React from 'react';
import { IDomain } from './hp-slider/interfaces';
import { EnumZoomSelected } from './hp-time-series-chart/state/enums';
import * as dateFns from 'date-fns';
import { EnumHandleType } from './hp-slider/enums';
import { hpTimeSeriesChartCalculations } from './hp-time-series-chart/calculations';
import { IHpTimeSeriesChartState } from './hp-time-series-chart/state';
import { HpSlider } from './hp-slider';
import { EnumHpTimeSeriesChartMode, HpTimeSeriesChart } from './hp-time-series-chart';
import { ButtonGroup, Button } from 'react-bootstrap';
import { IHpTimeSeriesChartScssGeneric, IHpSliderScssGeneric } from './sass/styles';

export interface IHpTimeSeriesScrollerProps {
  state: IHpTimeSeriesChartState;
  sliderScss: IHpSliderScssGeneric<number>;
  timeSeriesChartScss: IHpTimeSeriesChartScssGeneric<number>;
  zoomWindowLevelSet?: (zoomLevel: EnumZoomSelected, unixFrom: number, unixTo: number) => void;
  displayZoomLevelButtons?: boolean;
}

export interface IHpTimeSeriesScrollerState extends IHpTimeSeriesChartState { }

/**
 * This statefull component aggregates HpTimeSeriesChart and HpSlider components, 
 * making a demonstration how to use them.
 */
export class HpTimeSeriesScroller extends React.Component<IHpTimeSeriesScrollerProps, IHpTimeSeriesScrollerState> {
  constructor(props: IHpTimeSeriesScrollerProps) {
    super(props);
    this.state = _.extend({}, props.state);
  }

  componentWillReceiveProps(nextProps: Readonly<IHpTimeSeriesScrollerProps>, nextContext: any) {
    this.setState(_.extend({}, nextProps.state));
  }

  private getDomain = (): IDomain<number> => {
    switch (this.state.chartZoomSettings.zoomSelected) {
      case EnumZoomSelected.NoZoom:
        return { domainMin: this.state.dateRangeUnixFrom, domainMax: this.state.dateRangeUnixTo }
      case EnumZoomSelected.ZoomLevel1:
        return { 
          domainMin: this.state.chartZoomSettings.zoomLevel1FramePointsUnixFrom, 
          domainMax: this.state.chartZoomSettings.zoomLevel1FramePointsUnixTo 
        }
      case EnumZoomSelected.ZoomLevel2:
        return { 
          domainMin: this.state.chartZoomSettings.zoomLevel2FramePointsUnixFrom, 
          domainMax: this.state.chartZoomSettings.zoomLevel2FramePointsUnixTo 
        }
    }
  } 

  private _getZoomButtonStyle = (stateMode: EnumZoomSelected, expectedMode: EnumZoomSelected): string => {
    return stateMode == expectedMode ? "success" : "default";
  }

  private _isZoomButtonDisabled = (zoomLimitationLevelButtonIsPresenting: EnumZoomSelected, currentZoomLimitationLevel: EnumZoomSelected): boolean => {
    return Math.abs(zoomLimitationLevelButtonIsPresenting - currentZoomLimitationLevel) > 1;
  }

  private _getChartInSliderDimensions = (): IHpTimeSeriesChartScssGeneric<number> => {
    return {
      heightPx: this.props.sliderScss.heightPx,
      widthPx: this.props.timeSeriesChartScss.widthPx,
      paddingBottomPx: 0,
      paddingLeftPx: 0,
      paddingRightPx: 0,
      paddingTopPx: 0
    }
  }

  public render() {
    return (
      <span>
        <HpTimeSeriesChart scss={this.props.timeSeriesChartScss} state={this.state} />
        <br />
        <HpSlider
          domain={this.getDomain()}
          handleValues={{ left: this.state.windowUnixFrom, right: this.state.windowUnixTo }}
          scss={this.props.sliderScss}
          displayDragBar={true}
          handleMoved={(value: number | number[], type: EnumHandleType) => {
            let newUnixFrom = this.state.windowUnixFrom;
            let newUnixTo = this.state.windowUnixTo;
            switch (type) {
              case EnumHandleType.Left:
                newUnixFrom = _.isNumber(value) ? value : 0;
                break;
              case EnumHandleType.Right:
                newUnixTo = _.isNumber(value) ? value : 0;
                break;
              case EnumHandleType.DragBar:
                newUnixFrom = _.isArray(value) ? value[0] : 0
                newUnixTo = _.isArray(value) ? value[1] : 0
                break;
            }
            this.setState({
              windowUnixFrom: newUnixFrom,
              windowUnixTo: newUnixTo
            })
          }}
        >
          <HpTimeSeriesChart
            scss={this._getChartInSliderDimensions()}
            state={this.props.state}
            mode={EnumHpTimeSeriesChartMode.SliderEmbedded}
          />
        </HpSlider>
        <br />
        {_.isBoolean(this.props.displayZoomLevelButtons) && this.props.displayZoomLevelButtons &&
          <ButtonGroup>
            <Button
              type="button"
              disabled={this._isZoomButtonDisabled(EnumZoomSelected.NoZoom, this.state.chartZoomSettings.zoomSelected)} 
              bsSize="xs"
              onMouseUp={(e) => this.props.zoomWindowLevelSet(EnumZoomSelected.NoZoom, this.state.windowUnixFrom, this.state.windowUnixTo) } 
              bsStyle={this._getZoomButtonStyle(this.state.chartZoomSettings.zoomSelected, EnumZoomSelected.NoZoom)}>
              View All
            </Button>
            <Button 
              type="button"
              disabled={this._isZoomButtonDisabled(EnumZoomSelected.ZoomLevel1, this.state.chartZoomSettings.zoomSelected)}
              bsSize="xs" 
              onMouseUp={() => this.props.zoomWindowLevelSet(EnumZoomSelected.ZoomLevel1, this.state.windowUnixFrom, this.state.windowUnixTo) } 
              bsStyle={this._getZoomButtonStyle(this.state.chartZoomSettings.zoomSelected, EnumZoomSelected.ZoomLevel1)}>
              1
            </Button>
            <Button 
              type="button"
              disabled={this._isZoomButtonDisabled(EnumZoomSelected.ZoomLevel2, this.state.chartZoomSettings.zoomSelected)}
              bsSize="xs" 
              onMouseUp={() => this.props.zoomWindowLevelSet(EnumZoomSelected.ZoomLevel2, this.state.windowUnixFrom, this.state.windowUnixTo) } 
              bsStyle={this._getZoomButtonStyle(this.state.chartZoomSettings.zoomSelected, EnumZoomSelected.ZoomLevel2)}>
              2
            </Button>
          </ButtonGroup>
        }
      </span>
    );
  }
}
