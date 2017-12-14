import { HpTimeSeriesScroller } from '../../component';
import { hpTimeSeriesChartCalculations } from '../../hp-time-series-chart/calculations';
import { hpSliderHpTimeSeriesChartIntegration } from '../../hp-time-series-chart/hp-slider-integration';
import 'bootstrap/dist/css/bootstrap.css';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Panel, ButtonGroup, Button, ListGroup, ListGroupItem, Grid, Form, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock  } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import * as ui from '../../hp-time-series-chart/ui';
import { EnumChartPointsSelectionMode, EnumZoomSelected } from '../../hp-time-series-chart/state/enums';
import { IChartDimensions, IEventChartConfiguration }  from '../../hp-time-series-chart/interfaces';
import { ICsvRawParseConfiguration, ICsvColumn, EnumCsvDataType, ICsvDataLoadedContext }  from '../../hp-time-series-chart/csv-loading/models';
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
  setZoomWindowLevel: (level: EnumZoomSelected) => EnumZoomSelected,
  generateRandomData: (dates: Date[]) => void,
  setWindowDateFromTo: (dateFrom: Date, dateTo: Date) => void
}

class GraphScreenComponent extends React.Component<IGraphScreenProps & IGraphScreenDispatchProps, IGraphScreenState> {
  constructor(props: IGraphScreenProps & IGraphScreenDispatchProps) {
    super(props);
    this.state = {
      windowDateFrom: props.chartState.windowDateFrom,
      windowDateTo: props.chartState.windowDateTo
    };
  }

  private chartDimensions: IChartDimensions = {
    canvasHeight: 500,
    canvasWidth: 800,
    timeSeriesChartPaddingBottom: 50,
    timeSeriesChartPaddingLeft: 30,
    timeSeriesChartPaddingRight: 10,
    timeSeriesChartPaddingTop: 10
  };

  private eventChartConfiguration: IEventChartConfiguration = {
    fillColor: "red",
    heightPx: 30
  };

  private getCsvConfig = ():ICsvRawParseConfiguration => {
    let columns: ICsvColumn[] = [{
        type: EnumCsvDataType.DateTime,
        display: true
      }, {
        type: EnumCsvDataType.Float,
        display: true
      }, {
        type: EnumCsvDataType.Float,
        display: false
      }
    ];
    let result: ICsvRawParseConfiguration = {
      columns: columns,
      newLineCharacter: '\n',
      delimiter: ",",
      firstLineContainsHeaders: false
    };
    return result;
  }

  private getGraphPointsSelectionButtonStyle = (stateMode: EnumChartPointsSelectionMode, expectedMode: EnumChartPointsSelectionMode): string => {
    return stateMode == expectedMode ? "success" : "default";
  }

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
              <ControlLabel>{dateFns.format(this.props.chartState.dateRangeDateFrom, "YYYY-MM-DD HH:mm")}</ControlLabel>
            </Col>
            <Col componentClass={ControlLabel} md={2}>
              Samples to:
            </Col>
            <Col md={2}>
              <ControlLabel>{dateFns.format(this.props.chartState.dateRangeDateTo, "YYYY-MM-DD HH:mm")}</ControlLabel>
            </Col>
            <Col componentClass={ControlLabel} md={2}>
              Total number of series loaded:
            </Col>
            <Col md={2}>
              <ControlLabel>{this.props.chartState.series.length}</ControlLabel>
            </Col>
          </Row>
          <Row>
            <Col componentClass={ControlLabel} md={2}>
                Window date from:
            </Col>
            <Col md={2}>
              <ControlLabel>{dateFns.format(this.props.chartState.windowDateFrom, "YYYY-MM-DD HH:mm")}</ControlLabel>
            </Col>
            <Col componentClass={ControlLabel} md={2}>
              Window date to:
            </Col>
            <Col md={2}>
              <ControlLabel>{dateFns.format(this.props.chartState.windowDateTo, "YYYY-MM-DD HH:mm")}</ControlLabel>
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
                  onClick={() => {
                    let date = new Date();
                    this.props.generateRandomData([date, dateFns.addHours(date, 6), date, dateFns.addHours(date, 6)]);
                  }}>
                  Load random data
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
            <Col componentClass={ControlLabel} md={12}>
              <HpTimeSeriesScroller
                chartDimensions={this.chartDimensions}
                state={this.props.chartState}
                zoomWindowLevelSet={(level, from, to) => {
                  this.props.setWindowDateFromTo(from, to);
                  this.props.setZoomWindowLevel(level);
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
    generateRandomData: hpTimeSeriesChartActionCreators.generateRandomData,
    setWindowDateFromTo: hpTimeSeriesChartActionCreators.setWindowDateFromTo
  }, dispatch);
}

export const RealTimeTesting = connect<IGraphScreenProps, IGraphScreenDispatchProps, {}>(mapStateToProps, matchDispatchToProps)(GraphScreenComponent)