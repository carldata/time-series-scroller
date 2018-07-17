import * as _ from 'lodash';
import * as hpSliderStyles from './sass/hp-slider.scss';
import * as hpTimeSeriesChartStyles from './sass/hp-time-series-chart.scss';
import * as dateFns from 'date-fns';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { hpTimeSeriesChartCalculations, IHpTimeSeriesChartState, EnumHpTimeSeriesChartMode } from '../../hp-time-series-chart';
import { HpSlider } from '../../hp-slider';
import { IDomain, IHpSliderHandleValues } from '../../hp-slider/interfaces';
import { EnumHandleType } from '../../hp-slider/enums';
import { HpTimeSeriesChart } from '../../hp-time-series-chart';
import { bindActionCreators } from 'redux';
import { convertHpSliderScss, convertHpTimeSeriesChartScss, IHpSliderScssGeneric, IHpTimeSeriesChartScssGeneric } from '../../sass/styles';
import { loadCsv, ILoadCsvEffect } from '../../hp-time-series-chart/csv-loading/effects';
import { generateRandomSeries, IGenerateRandomSeriesActionCreator } from './action-creators';
import { IAppState, IChartsState } from './state';
import { BoostrapRowCard } from '../common/bootstrap-row-card';
import { handleMovedCallback, IHpSliderScss, IHpTimeSeriesChartScss, IUnixFromTo } from '../..';

const scss = {
  slider: convertHpSliderScss(hpSliderStyles),
  timeSeries: convertHpTimeSeriesChartScss(hpTimeSeriesChartStyles)
}

/**
 * External State - took from redux store
 */
export interface IDoItYourselfDemoComponentProps {
  chartsState: IChartsState;
}

export interface IDoItYourselfDemoComponentDispatchProps {
  generateRandomSeries: IGenerateRandomSeriesActionCreator
}

interface IDoItYourselfDemoComponentState extends IUnixFromTo {
  days: number;
  chartsState: IChartsState;
}

class DoItYourselfDemoComponent extends React.Component<IDoItYourselfDemoComponentProps & IDoItYourselfDemoComponentDispatchProps, IDoItYourselfDemoComponentState> {
  constructor(props: IDoItYourselfDemoComponentProps & IDoItYourselfDemoComponentDispatchProps) {
    super(props);
    this.state = {
      days: 12,
      chartsState: props.chartsState,
      windowUnixFrom: props.chartsState.dateRangeUnixFrom,
      windowUnixTo: props.chartsState.dateRangeUnixTo
    }
  }

  private _getChartInSliderDimensions = (): IHpTimeSeriesChartScssGeneric<number> => {
    return {
      heightPx: scss.slider.heightPx,
      widthPx: scss.slider.widthPx,
      paddingBottomPx: 5,
      paddingLeftPx: 0,
      paddingRightPx: 0,
      paddingTopPx: 5
    }
  }

  public componentWillReceiveProps(nextProps: Readonly<IDoItYourselfDemoComponentProps>, nextContext: any) {
    this.setState({
      chartsState: _.cloneDeep(nextProps.chartsState),
      windowUnixFrom: nextProps.chartsState.dateRangeUnixFrom,
      windowUnixTo: nextProps.chartsState.dateRangeUnixTo,
    } as IDoItYourselfDemoComponentProps);
  }

  public getDomain = (): IDomain<number> => {
    return { domainMin: this.state.chartsState.dateRangeUnixFrom, domainMax: this.state.chartsState.dateRangeUnixTo };
  }

  public render() {
    return (
      <div className="container container-fluid">
        <BoostrapRowCard title='Do it yourself example' 
          subtitle='Shows how to integrate HpSlider with several HpTimeSeriesChart components at the lower level'
          additionalCssStyle='text-white bg-primary border-bottom-0 rounded-0' />
        <BoostrapRowCard title='Chart info' additionalCssStyle='border-bottom-0 rounded-0'>
          <div className="row">
            <div className="col-sm-auto">Samples from: {dateFns.format(this.getDomain().domainMin, "YYYY-MM-DD HH:mm")}</div>
            <div className="col-sm-auto">to: {dateFns.format(this.getDomain().domainMax, "YYYY-MM-DD HH:mm")}</div>
          </div>
        </BoostrapRowCard>
        <BoostrapRowCard title='Random data' additionalCssStyle='rounded-0'>
          <form className="form-inline">
            <label>Number of days:</label>
            <input
              className="form-control-xs"
              type="number"
              min="2"
              max="365"
              step="1"
              onChange={(e) => this.setState({ days: _.parseInt(e.target.value) })}
              value={this.state.days} />
            <button type="button" className="btn btn-primary btn-sm" onClick={() => this.props.generateRandomSeries(new Date(), dateFns.addDays(new Date(), this.state.days))}>
              Generate and load random series
            </button>
          </form>
        </BoostrapRowCard>
        <BoostrapRowCard title='Random data' additionalCssStyle='rounded-0'>
          <div className="row" style={{ minHeight: scss.slider.heightPx, marginLeft: scss.timeSeries.paddingLeftPx }}>
            <div className="col">
              <HpSlider
                domain={this.getDomain()}
                handleValues={{ left: this.state.windowUnixFrom, right: this.state.windowUnixTo }}
                scss={scss.slider}
                displayDragBar={true}
                fitToParent={{ toWidth: true, offsetWidth: 35 }}
                handleMoved={(value: number | number[], type: EnumHandleType) => {
                  const { windowUnixFrom, windowUnixTo } = handleMovedCallback(value, type, this.state);
                  this.setState({
                    windowUnixFrom: windowUnixFrom,
                    windowUnixTo: windowUnixTo,
                    chartsState: { ...this.state.chartsState,
                      voltageChartState: { 
                        ...this.state.chartsState.voltageChartState,
                        windowUnixFrom: windowUnixFrom,
                        windowUnixTo: windowUnixTo,
                      },
                      rainfallChartState: {
                        ...this.state.chartsState.rainfallChartState,
                        windowUnixFrom: windowUnixFrom,
                        windowUnixTo: windowUnixTo,
                      },
                      waterflowChartState: { 
                        ...this.state.chartsState.waterflowChartState,
                        windowUnixFrom: windowUnixFrom,
                        windowUnixTo: windowUnixTo,
                      },
                    } as IChartsState
                  } as IDoItYourselfDemoComponentState);
                }}>
                <HpTimeSeriesChart
                  scss={this._getChartInSliderDimensions()}
                  state={this.props.chartsState.rainfallChartState}
                  mode={EnumHpTimeSeriesChartMode.SliderEmbedded}
                  fitToParent={{ toWidth: true, offsetWidth: 35 }}
                />
              </HpSlider>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <em>Rainfall</em><br />
              <HpTimeSeriesChart 
                scss={scss.timeSeries}
                state={this.state.chartsState.rainfallChartState}
                dateTimeAxisTickFormat={'%b-%d %H:%M'}
                fitToParent={{ toWidth: true, offsetWidth: 35 }} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <em>Voltage</em><br />
              <HpTimeSeriesChart
                scss={scss.timeSeries}
                state={this.state.chartsState.voltageChartState}
                fitToParent={{ toWidth: true, offsetWidth: 35 }} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <em>Water flow</em><br />
              <HpTimeSeriesChart
                scss={scss.timeSeries}
                state={this.state.chartsState.waterflowChartState}
                fitToParent={{ toWidth: true, offsetWidth: 35 }} />
            </div>
          </div>
          </BoostrapRowCard>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState): IDoItYourselfDemoComponentProps => {
  return {
    chartsState: state.chartsState
  }
};

const matchDispatchToProps = (dispatch: Dispatch<void>) =>
  bindActionCreators({
    generateRandomSeries: generateRandomSeries,
  }, dispatch);

export const DoItYourselfDemo = connect<IDoItYourselfDemoComponentProps, IDoItYourselfDemoComponentDispatchProps, {}>(mapStateToProps, matchDispatchToProps)(DoItYourselfDemoComponent)