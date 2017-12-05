import 'bootstrap/dist/css/bootstrap.css';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Panel, ButtonGroup, Button, ListGroup, ListGroupItem, Grid, Form, Row, Col, FormGroup, ControlLabel, FormControl, HelpBlock  } from 'react-bootstrap';
import * as Dropzone from 'react-dropzone'
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { calculations as c } from '../../hp-time-series-chart/calculations';
import * as ui from '../../hp-time-series-chart/ui';
import { EnumChartPointsSelectionMode, EnumZoomSelected } from '../../hp-time-series-chart/state/enums';
import { IChartDimensions, IEventChartConfiguration }  from '../../hp-time-series-chart/interfaces';
import { ICsvRawParseConfiguration, ICsvColumn, EnumCsvDataType, EnumCsvFileSource, ICsvDataLoadedActionResponse }  from '../../hp-time-series-chart/csv-loading/models';
import { chartActionCreators } from '../../hp-time-series-chart/action-creators';
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
  csvDataLoaded: (text: string, config: ICsvRawParseConfiguration) => ICsvDataLoadedActionResponse,
  setZoomWindowLevel: (level: EnumZoomSelected) => EnumZoomSelected,
  generateRandomData: (dates: Date[]) => void,
  setWindowDateFromTo: (dateFrom: Date, dateTo: Date) => void
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
      source: EnumCsvFileSource.LocalFileSystem,
      firstLineContainsHeaders: false
    };
    return result;
  }

  private dropZone: any;

  private getGraphPointsSelectionButtonStyle = (stateMode: EnumChartPointsSelectionMode, expectedMode: EnumChartPointsSelectionMode): string => {
    return stateMode == expectedMode ? "success" : "default";
  }

  private getZoomButtonStyle = (stateMode: EnumZoomSelected, expectedMode: EnumZoomSelected): string => {
    return stateMode == expectedMode ? "success" : "default";
  }

  private calculateSliderHandleValues = (state: IHpTimeSeriesChartState): IHpSliderHandleValues<number> => {
    return {
      left: c.translateDateTimeToMinutesDomain(state, state.windowDateFrom), 
      right: c.translateDateTimeToMinutesDomain(state, state.windowDateTo)
    };
  }

  private isZoomButtonDisabled = (zoomLimitationLevelButtonIsPresenting: EnumZoomSelected, currentZoomLimitationLevel: EnumZoomSelected): boolean => {
    return Math.abs(zoomLimitationLevelButtonIsPresenting - currentZoomLimitationLevel) > 1;
  }

  private parseCsvFiles = (files: File[]): void => {
    let fileReader = new FileReader();
    let file = _.first(files);
    fileReader.addEventListener("loadend", (e: ProgressEvent) => this.props.csvDataLoaded(fileReader.result, this.getCsvConfig()));
    fileReader.readAsText(file);
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
              <HpTimeSeriesChart
                eventChartConfiguration={this.eventChartConfiguration}
                chartDimensions={this.chartDimensions}
                state={this.props.chartState} />
            </Col>
          </Row>
          <Row>
            <Col componentClass={ControlLabel} md={12}>
              <ButtonGroup>
                <Button 
                  disabled={this.isZoomButtonDisabled(EnumZoomSelected.NoZoom, this.props.chartState.chartZoomSettings.zoomSelected)} 
                  bsSize="xs" 
                  onClick={() => this.props.setZoomWindowLevel(EnumZoomSelected.NoZoom) } 
                  bsStyle={this.getZoomButtonStyle(this.props.chartState.chartZoomSettings.zoomSelected, EnumZoomSelected.NoZoom)}>
                  View All
                </Button>
                <Button 
                  disabled={this.isZoomButtonDisabled(EnumZoomSelected.ZoomLevel1, this.props.chartState.chartZoomSettings.zoomSelected)}
                  bsSize="xs" 
                  onClick={() => { this.props.setZoomWindowLevel(EnumZoomSelected.ZoomLevel1) }} 
                  bsStyle={this.getZoomButtonStyle(this.props.chartState.chartZoomSettings.zoomSelected, EnumZoomSelected.ZoomLevel1)}>
                  {ui.getZoomLevelButtonCaption(EnumZoomSelected.ZoomLevel1, this.props.chartState)}
                </Button>
                <Button 
                  disabled={this.isZoomButtonDisabled(EnumZoomSelected.ZoomLevel2, this.props.chartState.chartZoomSettings.zoomSelected)}
                  bsSize="xs" 
                  onClick={() => this.props.setZoomWindowLevel(EnumZoomSelected.ZoomLevel2) } 
                  bsStyle={this.getZoomButtonStyle(this.props.chartState.chartZoomSettings.zoomSelected, EnumZoomSelected.ZoomLevel2)}>
                  {ui.getZoomLevelButtonCaption(EnumZoomSelected.ZoomLevel2, this.props.chartState)}
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
          <Row>
          <Col componentClass={ControlLabel} md={12}>
            <HpSlider 
              dimensions={{sliderWidthPx: 800, sliderHeightPx: 50, sliderHandleWidthThicknessPx: 10 }}
              domain={{ domainMin: 0, domainMax: c.calculateDomainLengthMinutes(this.props.chartState) }}
              handleValues={this.calculateSliderHandleValues(this.props.chartState)}
              displayDragBar={true}
              handleMoved={(value: number | number[], type: EnumHandleType) => {
                let handleValues = this.calculateSliderHandleValues(this.props.chartState);
                let newDateFrom = c.translateUnixMinutesDomainToDateTime(this.props.chartState, handleValues.left);
                let newDateTo = c.translateUnixMinutesDomainToDateTime(this.props.chartState, handleValues.right);
                switch (type) {
                  case EnumHandleType.Left:
                    newDateFrom = c.translateUnixMinutesDomainToDateTime(this.props.chartState, _.isNumber(value) ? value : 0);
                    break;
                  case EnumHandleType.Right:
                    newDateTo = c.translateUnixMinutesDomainToDateTime(this.props.chartState, _.isNumber(value) ? value : 0);
                    break;
                  case EnumHandleType.DragBar:
                    newDateFrom = c.translateUnixMinutesDomainToDateTime(this.props.chartState, value[0]);
                    newDateTo = c.translateUnixMinutesDomainToDateTime(this.props.chartState, value[1]);
                    break;
                }
                this.props.setWindowDateFromTo(newDateFrom, newDateTo);
              }}
            />
          </Col>
        </Row>
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
    csvDataLoaded: chartActionCreators.csvDataLoaded,
    setZoomWindowLevel: chartActionCreators.setZoomWindowLevel,
    generateRandomData: chartActionCreators.generateRandomData,
    setWindowDateFromTo: chartActionCreators.setWindowDateFromTo
  }, dispatch);
}

export const RealTimeTesting = connect<IGraphScreenProps, IGraphScreenDispatchProps, {}>(mapStateToProps, matchDispatchToProps)(GraphScreenComponent)