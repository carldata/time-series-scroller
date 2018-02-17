import 'bootstrap/dist/css/bootstrap.css';
import * as hpSliderStyles from '../../sass/hp-slider.scss';
import * as hpTimeSeriesChartStyles from '../../sass/hp-time-series-chart.scss';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Panel, ButtonGroup, Button, ListGroup, ListGroupItem, Grid, Form, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock, ButtonToolbar, Checkbox  } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { hpTimeSeriesChartCsvLoadingActionCreators } from '../../hp-time-series-chart/csv-loading/action-creators';
import { hpTimeSeriesChartCalculations } from '../../hp-time-series-chart/calculations';
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
import { HpTimeSeriesScroller } from '../../time-series-scroller';
import { ITimeSeriesScrollerDimensions } from '../../time-series-scroller-dimensions';

export interface IGraphScreenProps {
  chartState: IHpTimeSeriesChartState;
}

export interface IGraphScreenState {
  useStreaming: boolean;
}

export interface IGraphScreenDispatchProps {
  setZoomWindowLevel: (level: EnumZoomSelected, widthPx: number) => EnumZoomSelected,
  generateRandomData: (dates: Date[]) => void,
  loadCsv: (url: string, useStreaming: boolean) => void,
  setWindowUnixFromTo: (unixFrom: number, unixTo: number) => void
}

class GraphScreenComponent extends React.Component<IGraphScreenProps & IGraphScreenDispatchProps, IGraphScreenState> {
  constructor(props: IGraphScreenProps & IGraphScreenDispatchProps) {
    super(props);
    this.state = {
      useStreaming: false
    }
  }

  public render() {
    const dimensions: ITimeSeriesScrollerDimensions = {
      widthPx: parseInt(hpTimeSeriesChartStyles.widthPx),
      heightPx: parseInt(hpTimeSeriesChartStyles.heightPx),
      paddingBottomPx: parseInt(hpTimeSeriesChartStyles.paddingBottomPx),
      paddingLeftPx: parseInt(hpTimeSeriesChartStyles.paddingLeftPx),
      paddingRightPx: parseInt(hpTimeSeriesChartStyles.paddingRightPx),
      paddingTopPx: parseInt(hpTimeSeriesChartStyles.paddingTopPx),
      sliderHandleWidthPx: parseInt(hpSliderStyles.handleWidthPx),
      sliderHeightPx: parseInt(hpSliderStyles.heightPx)
    };
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
            <Col>
              <Form inline>
                <FormGroup >
                  <ButtonGroup>
                    <Button 
                      bsSize="xs" 
                      onClick={() => this.props.loadCsv("50.csv", this.state.useStreaming)}>
                      Load 50
                    </Button>
                    <Button
                      bsSize="xs" 
                      onClick={() => this.props.loadCsv("50k.csv", this.state.useStreaming)}>
                      Load 50k
                    </Button>
                    <Button
                      bsSize="xs" 
                      onClick={() => this.props.loadCsv("250k.csv", this.state.useStreaming)}>
                      Load 250k
                    </Button>
                    <Button
                      bsSize="xs" 
                      onClick={() => this.props.loadCsv("2M.csv", this.state.useStreaming)}>
                      Load 2M
                    </Button>
                    <Button
                      bsSize="xs" 
                      onClick={() => this.props.loadCsv("4M.csv", this.state.useStreaming)}>
                      Load 4M
                    </Button>
                    <Button
                      bsSize="xs" 
                      onClick={() => this.props.loadCsv("10M.csv", this.state.useStreaming)}>
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
                </FormGroup>
                <FormGroup>
                  <Checkbox inline 
                    checked={this.state.useStreaming} 
                    onChange={() => 
                      this.setState({ useStreaming: !this.state.useStreaming }) }>
                    Use streaming
                  </Checkbox>
                </FormGroup>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col componentClass={ControlLabel}>
              <HpTimeSeriesScroller
                dimensions={dimensions}
                state={this.props.chartState}
                zoomWindowLevelSet={(level, unixFrom, unixTo) => {
                  this.props.setWindowUnixFromTo(unixFrom, unixTo);
                  this.props.setZoomWindowLevel(level, dimensions.widthPx);
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