import { hpTimeSeriesChartCsvLoadingActionCreators } from '../../hp-time-series-chart/csv-loading/action-creators';
import { HpTimeSeriesScroller } from '../../component';
import { hpTimeSeriesChartCalculations } from '../../hp-time-series-chart/calculations';
import 'bootstrap/dist/css/bootstrap.css';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Panel, ButtonGroup, Button, ListGroup, ListGroupItem, Grid, Form, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock  } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { EnumZoomSelected } from '../../hp-time-series-chart/state/enums';
import { IChartDimensions }  from '../../hp-time-series-chart/interfaces';
import { ICsvColumn, EnumCsvDataType, ICsvDataLoadedContext }  from '../../hp-time-series-chart/csv-loading/models';
import { hpTimeSeriesChartActionCreators } from '../../hp-time-series-chart/action-creators';
import { HpSlider } from '../../hp-slider';
import { IDomain, IHpSliderScreenDimensions, IHpSliderHandleValues } from '../../hp-slider/interfaces';
import { EnumHandleType } from '../../hp-slider/enums';
import { HpTimeSeriesChart } from '../../hp-time-series-chart';
import { bindActionCreators } from 'redux';
import { IAppState } from '../state/index';
import { IHpTimeSeriesChartState } from '../../hp-time-series-chart/state';

export interface IGraphScreenProps {
  chartState: IHpTimeSeriesChartState;
}

export interface IGraphScreenState {
}

export interface IGraphScreenDispatchProps {
  setZoomWindowLevel: (level: EnumZoomSelected, widthPx: number) => EnumZoomSelected,
  generateRandomData: (dates: Date[]) => void,
  loadCsv: (url: string) => void,
  setWindowUnixFromTo: (unixFrom: number, unixTo: number) => void
}

class GraphScreenComponent extends React.Component<IGraphScreenProps & IGraphScreenDispatchProps, IGraphScreenState> {
  constructor(props: IGraphScreenProps & IGraphScreenDispatchProps) {
    super(props);
  }

  private chartDimensions: IChartDimensions = {
    canvasHeight: 500,
    canvasWidth: 800,
    timeSeriesChartPaddingBottom: 50,
    timeSeriesChartPaddingLeft: 30,
    timeSeriesChartPaddingRight: 10,
    timeSeriesChartPaddingTop: 10
  };

  public render() {
    return (
      <div>
        <Grid>
          <Row>
            <Col md={12}><h3>Graph Screen</h3></Col>
          </Row>
          <Row>
            <Col componentClass={ControlLabel} md={2}>
              Samples from:
            </Col>
            <Col md={2}>
              <ControlLabel>{dateFns.format(this.props.chartState.dateRangeUnixFrom, "YYYY-MM-DD HH:mm")}</ControlLabel>
            </Col>
            <Col componentClass={ControlLabel} md={2}>
              Samples to:
            </Col>
            <Col md={2}>
              <ControlLabel>{dateFns.format(this.props.chartState.dateRangeUnixTo, "YYYY-MM-DD HH:mm")}</ControlLabel>
            </Col>
            <Col componentClass={ControlLabel} md={2}>
              Total number of series/samples:
            </Col>
            <Col md={2}>
              <ControlLabel>
                {this.props.chartState.series.length}/{_.flatMap(this.props.chartState.series, s => s.points).length}
              </ControlLabel>
            </Col>
          </Row>
          <Row>
            <Col componentClass={ControlLabel} md={2}>
                Window date from:
            </Col>
            <Col md={2}>
              <ControlLabel>{dateFns.format(this.props.chartState.windowUnixFrom, "YYYY-MM-DD HH:mm")}</ControlLabel>
            </Col>
            <Col componentClass={ControlLabel} md={2}>
              Window date to:
            </Col>
            <Col md={2}>
              <ControlLabel>{dateFns.format(this.props.chartState.windowUnixTo, "YYYY-MM-DD HH:mm")}</ControlLabel>
            </Col>
            <Col componentClass={ControlLabel} md={2}>
              Min. window width:
            </Col>
            <Col md={2}>
              -
            </Col>
          </Row>
          <Row>
            <Col componentClass={ControlLabel} md={12}>
              <ButtonGroup>
                <Button 
                  bsSize="xs" 
                  onClick={() => this.props.loadCsv("50.csv")}>
                  Load 50
                </Button>
                <Button 
                  bsSize="xs" 
                  onClick={() => this.props.loadCsv("50k.csv")}>
                  Load 50k
                </Button>
                <Button 
                  bsSize="xs" 
                  onClick={() => this.props.loadCsv("250k.csv")}>
                  Load 250k4
                </Button>
                <Button 
                  bsSize="xs" 
                  onClick={() => this.props.loadCsv("2M.csv")}>
                  Load 2M
                </Button>
                <Button 
                  bsSize="xs" 
                  onClick={() => this.props.loadCsv("4M.csv")}>
                  Load 4M
                </Button>
                <Button 
                  bsSize="xs" 
                  onClick={() => this.props.loadCsv("10M.csv")}>
                  Load 10M
                </Button>
                <Button 
                  bsSize="xs" 
                  onClick={() => {
                    let date = new Date();
                    this.props.generateRandomData([date, 
                                                   dateFns.addMonths(date, 2*12), 
                                                   date, 
                                                   dateFns.addMonths(date, 2*12)]);
                  }}>
                  Generate 1M
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
            <Col componentClass={ControlLabel} md={12}>
              <HpTimeSeriesScroller
                chartDimensions={this.chartDimensions}
                state={this.props.chartState}
                zoomWindowLevelSet={(level, unixFrom, unixTo) => {
                  this.props.setWindowUnixFromTo(unixFrom, unixTo);
                  this.props.setZoomWindowLevel(level, this.chartDimensions.canvasWidth);
                }}
              />
            </Col>
          </Row>
         </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state: IAppState): IGraphScreenProps => {
  return {
    chartState: state.chartState
  }
};

const matchDispatchToProps = (dispatch: Dispatch<void>) => {
  return bindActionCreators({
    setZoomWindowLevel: hpTimeSeriesChartActionCreators.setZoomWindowLevel,
    loadCsv: hpTimeSeriesChartCsvLoadingActionCreators.loadCsv,
    generateRandomData: hpTimeSeriesChartActionCreators.generateRandomData,
    setWindowUnixFromTo: hpTimeSeriesChartActionCreators.setWindowUnixFromTo
  }, dispatch);
}

export const RealTimeTesting = connect<IGraphScreenProps, IGraphScreenDispatchProps, {}>(mapStateToProps, matchDispatchToProps)(GraphScreenComponent)