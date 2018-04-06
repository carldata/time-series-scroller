import * as _ from 'lodash';
import * as hpSliderStyles from '../../sass/hp-slider.scss';
import * as hpTimeSeriesChartStyles from '../../sass/hp-time-series-chart.scss';
import * as dateFns from 'date-fns';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { hpTimeSeriesChartCalculations } from '../../hp-time-series-chart/calculations';
import { HpSlider } from '../../hp-slider';
import { IDomain, IHpSliderHandleValues } from '../../hp-slider/interfaces';
import { EnumHandleType } from '../../hp-slider/enums';
import { HpTimeSeriesChart } from '../../hp-time-series-chart';
import { bindActionCreators } from 'redux';
import { IHpTimeSeriesChartState } from '../../hp-time-series-chart/state';
import { HpTimeSeriesScroller } from '../../time-series-scroller';
import { convertHpSliderScss, convertHpTimeSeriesChartScss } from '../../sass/styles';
import { loadCsv, ILoadCsvEffect } from '../../hp-time-series-chart/csv-loading/effects';
import { generateTwoRandomSeries, IGenerateTwoRandomSeriesActionCreator } from './action-creators';
import { IAppState } from './state';
import { BoostrapRowCard } from './bootstrap-row-card';

export interface IGraphScreenProps {
  chartState: IHpTimeSeriesChartState;
}

export interface IGraphScreenState {
  useStreaming: boolean;
  days: number;
}

export interface IGraphScreenDispatchProps {
  generateTwoRandomSeries: IGenerateTwoRandomSeriesActionCreator,
  loadCsv: ILoadCsvEffect,
}

class GraphScreenComponent extends React.Component<IGraphScreenProps & IGraphScreenDispatchProps, IGraphScreenState> {
  constructor(props: IGraphScreenProps & IGraphScreenDispatchProps) {
    super(props);
    this.state = {
      useStreaming: false,
      days: 2
    }
  }

  private isWorkingInDevMode = (): boolean =>
    _.startsWith(document.baseURI, 'http://localhost:9000');

  public render() {
    return (
      <div className="container container-fluid">
        <BoostrapRowCard title='Graph Screen' 
          subtitle='Display demo of HpTimeSeriesScroller controller'
          additionalCssStyle='text-white bg-primary border-bottom-0 rounded-0' />
        <BoostrapRowCard title='Chart info' additionalCssStyle='border-bottom-0 rounded-0'>
          <div className="row">
            <div className="col-sm-auto">Samples from: {dateFns.format(this.props.chartState.dateRangeUnixFrom, "YYYY-MM-DD HH:mm")}</div>
            <div className="col-sm-auto">to: {dateFns.format(this.props.chartState.dateRangeUnixTo, "YYYY-MM-DD HH:mm")}</div>
            <div className="col-sm-auto">number of series/samples: {this.props.chartState.series.length}/{_.flatMap(this.props.chartState.series, s => s.points).length}</div>
          </div>
        </BoostrapRowCard>
        <BoostrapRowCard title='Pregenerated-CSV files loading' additionalCssStyle='border-bottom-0 rounded-0'>
          <form className="form-inline">
            <div className="btn-group btn-group-sm">
              <button type="button" className="btn btn-primary" onClick={() => this.props.loadCsv("50.csv", this.state.useStreaming)}>
                Load 50
              </button>
              <button type="button" className="btn btn-primary" onClick={() => this.props.loadCsv("10k.csv", this.state.useStreaming)}>
                Load 10k
              </button>
              {this.isWorkingInDevMode() && <button type="button" className="btn btn-primary" onClick={() => this.props.loadCsv("50k.csv", this.state.useStreaming)}>
                Load 50k
              </button>}
              {this.isWorkingInDevMode() && <button type="button" className="btn btn-primary" onClick={() => this.props.loadCsv("250k.csv", this.state.useStreaming)}>
                Load 250k
              </button>}
              {this.isWorkingInDevMode() && <button type="button" className="btn btn-primary" onClick={() => this.props.loadCsv("2M.csv", this.state.useStreaming)}>
                Load 2M
              </button>}
            </div> &nbsp;
            <label htmlFor="chbUseStreaming">
              <input
                id="chbUseStreaming" 
                type="checkbox"
                checked={this.state.useStreaming} 
                onChange={() => this.setState({ useStreaming: !this.state.useStreaming })}>
              </input>
              Use streaming &nbsp; {this.state.useStreaming && <small className="form-text text-muted">Instructs PapaParse to load CSV in chunks</small>} 
            </label>
          </form>
          <small className="form-text text-muted">Hint: use CsvTimeSeriesGenerator C# utility to generate sample CSV files</small>
        </BoostrapRowCard>
        <BoostrapRowCard title='Random CSV generation and loading' additionalCssStyle='rounded-0'>
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
            <button type="button" className="btn btn-primary btn-sm" onClick={() => this.props.generateTwoRandomSeries(new Date(), dateFns.addDays(new Date(), this.state.days))}>
              Generate and load random series
            </button>
          </form>
        </BoostrapRowCard> 
        <div className="row time-series-scroller">
          <HpTimeSeriesScroller
            sliderScss={convertHpSliderScss(hpSliderStyles)}
            timeSeriesChartScss={convertHpTimeSeriesChartScss(hpTimeSeriesChartStyles)}
            chartState={this.props.chartState}
            fitToParentSize
            interactions={{
              mouseButtonDown: (unixTime) => console.log(`Mouse button down ${new Date(unixTime)}`),
              mouseButtonUp: (unixTime) => console.log(`Mouse button up ${new Date(unixTime)}`),
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState): IGraphScreenProps => {
  return {
    chartState: state.chartState
  }
};

const matchDispatchToProps = (dispatch: Dispatch<void>) =>
  bindActionCreators({
    loadCsv: loadCsv,
    generateTwoRandomSeries: generateTwoRandomSeries,
  }, dispatch);

export const GraphScreen = connect<IGraphScreenProps, IGraphScreenDispatchProps, {}>(mapStateToProps, matchDispatchToProps)(GraphScreenComponent)