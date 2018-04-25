import * as _ from 'lodash';
import * as React from 'react';
import { IHpTimeSeriesChartBaseProps, HpTimeSeriesChartBase } from './base-component';
import { IHpTimeSeriesChartScss } from '../sass/styles';

export interface IParentSizeFitParamaters {
  toWidth?: boolean;
  toHeight?: boolean;
  /**
   * If fitToParentWidth is true, defines the offset of width that will be substracted
   * from parent HTML client width and set as the final width to rendered SVG element
   */
  offsetWidth?: number;
  /**
   * If fitToParentWidth is true, defines the offset of height that will be substracted
   * from parent HTML client height and set as the final height to rendered SVG element
   */
  offsetHeight?: number;
}

export interface IHpTimeSeriesChartProps extends IHpTimeSeriesChartBaseProps {
  fitToParent?: IParentSizeFitParamaters;  
}

interface IHpTimeSeriesChartState {
  /**
   * Since there are fitToParentWidth, fitToParentHeight props, 
   * we could keep recommended width/height in state only.
   * However, it is much more convenient to store it in scss object -
   * this is why IHpTimeSeriesChartScss is stored in state.
   */
  scss: IHpTimeSeriesChartScss;
}

export class HpTimeSeriesChart extends React.Component<IHpTimeSeriesChartProps, IHpTimeSeriesChartState> {
  private parentElement: HTMLElement = null;

  constructor(props: IHpTimeSeriesChartProps) {
    super(props);
    this.state = {
      scss: props.scss
    }
  }

  private fitToParentWidth = (): boolean => _.isObject(this.props.fitToParent) && _.isBoolean(this.props.fitToParent.toWidth) && this.props.fitToParent.toWidth;
  private fitToParentHeight = (): boolean => _.isObject(this.props.fitToParent) && _.isBoolean(this.props.fitToParent.toHeight) && this.props.fitToParent.toHeight;

  private fitToParentWidthOffset = (): number => _.isObject(this.props.fitToParent) && _.isNumber(this.props.fitToParent.offsetWidth) ? this.props.fitToParent.offsetWidth : 0;
  private fitToParentHeightOffset = (): number => _.isObject(this.props.fitToParent) && _.isNumber(this.props.fitToParent.offsetHeight) ? this.props.fitToParent.offsetHeight : 0;

  private resizeCallback = () => {
    if (_.isObject(this.parentElement)) {
      if (this.fitToParentWidth()) {
        this.setState({
          scss: { ...this.state.scss, 
            widthPx: this.parentElement.clientWidth - this.fitToParentWidthOffset(),
          } as IHpTimeSeriesChartScss
        });
      }
      if (this.fitToParentHeight()) {
        this.setState({
          scss: { ...this.state.scss, 
            heightPx: this.parentElement.clientHeight - this.fitToParentHeightOffset(),
          } as IHpTimeSeriesChartScss
        });
      }
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

  public componentWillReceiveProps(nextProps: Readonly<IHpTimeSeriesChartState>, nextContext: any) {
    this.setState({
      scss: { ...nextProps.scss, 
        widthPx: this.fitToParentWidth() ? this.parentElement.clientWidth - this.fitToParentWidthOffset() : nextProps.scss.widthPx,
        heightPx: this.fitToParentHeight() ? this.parentElement.clientWidth - this.fitToParentHeightOffset() : nextProps.scss.heightPx,
      }
    });
  }

  public render() {
    return <HpTimeSeriesChartBase
      parentCallback={(svg) => {
        if (!_.isObject(this.parentElement) && _.isObject(svg)) {
          this.parentElement = svg.parentElement;
          this.resizeCallback();
      }}}
      {...this.props}
      scss={this.state.scss}
    />;
  }
}