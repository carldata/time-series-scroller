import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';
import { IDomain } from '../hp-slider/interfaces';
import { EnumHandleType } from '../hp-slider/enums';
import { hpTimeSeriesChartCalculations } from '../hp-time-series-chart/calculations';
import { HpSlider } from '../hp-slider';
import { EnumHpTimeSeriesChartMode, HpTimeSeriesChart } from '../hp-time-series-chart';
import { IHpTimeSeriesChartScssGeneric, IHpSliderScssGeneric } from '../sass/styles';
import { IHpTimeSeriesChartState } from '../hp-time-series-chart/state';

export interface IHpTimeSeriesScrollerProps {
  chartState: IHpTimeSeriesChartState;
  sliderScss: IHpSliderScssGeneric<number>;
  timeSeriesChartScss: IHpTimeSeriesChartScssGeneric<number>;
  displaySlider?: boolean;
  fitToParentSize?: boolean;
}

export interface IHpTimeSeriesScrollerState { 
  windowUnixFrom: number;
  windowUnixTo: number;
  chartState: IHpTimeSeriesChartState;
  sliderScss: IHpSliderScssGeneric<number>;
  timeSeriesChartScss: IHpTimeSeriesChartScssGeneric<number>;
}

/**
 * This statefull component aggregates HpTimeSeriesChart and HpSlider components, acting as an example how to use them. 
 * It can be used as a production-ready solution as well.
 * For non-Redux usage please HpTimeSeriesScrollerWrapper.
 */
export class HpTimeSeriesScroller extends React.Component<IHpTimeSeriesScrollerProps, IHpTimeSeriesScrollerState> {
  private parentElement: HTMLElement;

  constructor(props: IHpTimeSeriesScrollerProps) {
    super(props);
    this.state = {
      windowUnixFrom: props.chartState.dateRangeUnixFrom,
      windowUnixTo: props.chartState.dateRangeUnixTo,
      chartState: _.cloneDeep(props.chartState),
      sliderScss: props.sliderScss,
      timeSeriesChartScss: props.timeSeriesChartScss
    };
  }

  componentWillReceiveProps(nextProps: Readonly<IHpTimeSeriesScrollerProps>, nextContext: any) {
    this.setState(_.extend({}, {
      chartState: _.cloneDeep(nextProps.chartState),
      sliderScss: _.extend(nextProps.sliderScss,
        _.isObject(this.parentElement) && _.isBoolean(this.props.fitToParentSize) && this.props.fitToParentSize ? {
          widthPx: this.parentElement.clientWidth
        } as IHpSliderScssGeneric<number> : {}),  
      timeSeriesChartScss: _.extend(nextProps.timeSeriesChartScss, 
        _.isObject(this.parentElement) && _.isBoolean(this.props.fitToParentSize) && this.props.fitToParentSize ? {
          widthPx: this.parentElement.clientWidth,
          heightPx: this.parentElement.clientHeight
        } as IHpTimeSeriesChartScssGeneric<number> : {}),
      windowUnixFrom: nextProps.chartState.windowUnixFrom,
      windowUnixTo: nextProps.chartState.windowUnixTo
    } as IHpTimeSeriesScrollerState));
  }

  private getDomain = (): IDomain<number> => {
    return { domainMin: this.props.chartState.dateRangeUnixFrom, domainMax: this.props.chartState.dateRangeUnixTo }
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

  private resizeCallback = () => {
    if (_.isObject(this.parentElement) && _.isBoolean(this.props.fitToParentSize) && this.props.fitToParentSize) {
      this.setState({
        sliderScss: _.extend(this.state.sliderScss, {
          widthPx: this.parentElement.clientWidth
        } as IHpSliderScssGeneric<number>),
        timeSeriesChartScss: _.extend(this.state.timeSeriesChartScss, {
          widthPx: this.parentElement.clientWidth,
          heightPx: this.parentElement.clientHeight
        } as IHpTimeSeriesChartScssGeneric<number>)
      })
    }
  }

  public componentWillMount() {
    this.resizeCallback();
  }

  public componentDidMount() {
    window.addEventListener("resize", this.resizeCallback);
    this.resizeCallback();
  }
  
  public componentWillUnmount() {
    window.removeEventListener("resize", this.resizeCallback);
  }

  public render() {
    return (<div ref={(el) => { 
      if (_.isObject(el))
        this.parentElement = el.parentElement;
    }}>
      <HpTimeSeriesChart scss={this.state.timeSeriesChartScss} state={this.state.chartState} />
      <br />
      {(_.isBoolean(this.props.displaySlider) ? this.props.displaySlider : true) &&
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
              windowUnixTo: newUnixTo,
              chartState: _.extend(this.state.chartState, {
                windowUnixFrom: newUnixFrom,
                windowUnixTo: newUnixTo
              } as IHpTimeSeriesChartState)
            })
          }}>
          <HpTimeSeriesChart
            scss={this._getChartInSliderDimensions()}
            state={this.props.chartState}
            mode={EnumHpTimeSeriesChartMode.SliderEmbedded}
          />
        </HpSlider>}
      </div>);
  }
}