import * as _ from 'lodash';
import * as React from 'react';
import { common } from './common';
import { calculations } from './calculations';
import { IDomain, IHpSliderHandleValues } from './interfaces';
import { HpSliderHandle, IHpSliderHandleMoved } from './components/handle';
import { EnumHandleType } from './enums';
import { IHpSliderScss } from '../sass/styles';

export interface IHpSliderProps {
  scss: IHpSliderScss;
  /**
   * The (real number, linear) domain provided for convenience of a particluar applications.
   * See that IDomain<T> is a generic interface - in the future there can be a different (unit) type applied.
   * 
   * For example, let's say: 
   * - the slider is 1024px wide 
   * - we can set voltage to a device in [-12V, +12V] range
   * 
   * The domain in volage in [-12V, +12V] range.
   */
  domain: IDomain<number>;
  /**
   * Value in domain (units), not pixels
   */
  handleValues: IHpSliderHandleValues<number>;
  /**
   * Renders an additional element called a "drag bar", since it is designed for dragging.
   */
  displayDragBar: boolean;
  handleMoved: IHpSliderHandleMoved;  
}

export interface IHpSliderState {
  pressedHandle?: EnumHandleType | null;
  previousScreenX?: number;
}

export class HpSlider extends React.Component<IHpSliderProps, IHpSliderState>{
  constructor(props) {
    super(props);
    this.state = {
      pressedHandle: null,
      previousScreenX: null
    };
  }

  public componentDidMount() {
    window.addEventListener('mouseup', this.globalMouseUp, false);
  }

  public componentWillUnmount() {
    window.removeEventListener('mouseup', this.globalMouseUp);
  }

  getSliderStyle = (): React.CSSProperties => {
    let result: React.CSSProperties = {
      width: this.props.scss.widthPx,
      position: "relative"
    };
    return result;
  }

  getSvgStyle = (): React.CSSProperties => {
    let result: React.CSSProperties = {
      width: this.props.scss.widthPx,
      position: "absolute",
      backgroundColor: "white"
    };
    return result;
  }

  getValueOfPressedHandle = (): number => { 
    let result = 0;
    switch (this.state.pressedHandle) {
      case EnumHandleType.Left:
        result = this.props.handleValues.left;
        break;
      case EnumHandleType.Right:
        result = this.props.handleValues.right;
        break;
    }
    return result;
  }

  globalMouseUp = (): boolean => {
    this.setState({ previousScreenX: null, pressedHandle: null })
    return true;
  }
  
  /**
   * Unfortunately, we cannot rely on props values for left, right handle position completely.
   * These can be provided wrong, but the component should render correctly or 
   * as correctly as possible - (left handle should be always before the right handle).
   */
  correctedHandleValues = (): number[] => {
    let handleWidthInDomainUnits = calculations.expressLengthPxInDomain(this.props.domain, this.props.scss, this.props.scss.handleWidthPx);
    let result: number[] = [this.props.handleValues.left, this.props.handleValues.right];
    let handleDifferenceInDomainUnits = this.props.handleValues.right - this.props.handleValues.left;
    if (handleDifferenceInDomainUnits < 2*handleWidthInDomainUnits) {
      //do not touch the left handle... move the right one !
      if (this.props.handleValues.left - this.props.domain.domainMin < handleWidthInDomainUnits)
        result[1] = this.props.handleValues.left+2*handleWidthInDomainUnits;
      //in all other cases - move the left one (includes "do not touch the right handle" scenario) !
      else
        result[0] = this.props.handleValues.right-2*handleWidthInDomainUnits;
    }
    return result;
  }

  acceptNewValueForHandle(newValue: number | number[]): boolean {
    let result = true;
    let valueLeft: number | null = null;
    let valueRight: number | null = null;
    switch (this.state.pressedHandle) {
      case EnumHandleType.Left:
        valueLeft = _.isNumber(newValue) ? newValue : valueLeft;
        break;
      case EnumHandleType.Right:
        valueRight = _.isNumber(newValue) ? newValue : valueRight;
        break;
      case EnumHandleType.DragBar:
        valueLeft = _.isArray(newValue) ? newValue[0] : valueLeft;
        valueRight = _.isArray(newValue) ? newValue[1] : valueRight;
        break;
    }
    if (_.isNumber(valueLeft))  
      result = result && _.inRange(valueLeft, this.props.domain.domainMin, this.props.domain.domainMax);
    if (_.isNumber(valueRight))
      result = result && _.inRange(valueRight, this.props.domain.domainMin, this.props.domain.domainMax);
    return result;
  }

  render() { 
    let correctedValues = this.correctedHandleValues();
    return (
      <div className="hp-slider">
        {this.props.children}
        <div 
          style={{ width: this.props.scss.widthPx, position: "absolute" }}
          className="hp-slider-inner-border-rect"
        />
        <HpSliderHandle
          key="handle_left"
          domain={this.props.domain}
          scss={this.props.scss}
          value={correctedValues[0]}
          handleType={EnumHandleType.Left}
          onMoved={(newValue: number, type: EnumHandleType) => {
            if (this.acceptNewValueForHandle(newValue))
              this.props.handleMoved(newValue, type);
          }}
          onPressed={(isPressed: boolean, type: EnumHandleType) => {
            this.setState({ pressedHandle: isPressed ? type : null });
          }}
        />
        {this.props.displayDragBar && 
          <HpSliderHandle
            scss={this.props.scss}
            domain={this.props.domain}
            handleType={EnumHandleType.DragBar}
            onMoved={(newValue: number[], type: EnumHandleType) => {
              if (this.acceptNewValueForHandle(newValue))
                this.props.handleMoved(newValue, type);
            }}
            onPressed={(isPressed: boolean, type: EnumHandleType) => {
              this.setState({ pressedHandle: isPressed ? type : null });
            }}
            value={correctedValues}
            key="handle_dragBar" 
          />}
        <HpSliderHandle
          key="handle_right" 
          domain={this.props.domain}
          scss={this.props.scss}
          value={correctedValues[1]}
          handleType={EnumHandleType.Right}
          onMoved={(newValue: number, type: EnumHandleType) => {
            if (this.acceptNewValueForHandle(newValue))
              this.props.handleMoved(newValue, type);
          }}
          onPressed={(isPressed: boolean, type: EnumHandleType) => {
            this.setState({ pressedHandle: isPressed ? type : null });
          }}
        />
      </div>);
  }
}