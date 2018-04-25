import * as _ from 'lodash';
import * as React from 'react';
import { IHpTimeSeriesChartBaseProps, HpTimeSeriesChartBase } from './base-component';
import { IHpTimeSeriesChartScss } from '../sass/styles';
import { HpResizeableComponent, IHpResizeableComponentProps, IHpResizeableComponentState } from '../hp-resizeable';

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

export interface IHpTimeSeriesChartProps extends IHpTimeSeriesChartBaseProps, IHpResizeableComponentProps<IHpTimeSeriesChartScss> {
}

interface IHpTimeSeriesChartState extends IHpResizeableComponentState {
  /**
   * Since there are fitToParentWidth, fitToParentHeight props, 
   * we could keep recommended width/height in state only.
   * However, it is much more convenient to store it in scss object -
   * this is why IHpTimeSeriesChartScss is stored in state.
   */
  scss: IHpTimeSeriesChartScss;
}

export class HpTimeSeriesChart extends HpResizeableComponent<IHpTimeSeriesChartBaseProps & IHpResizeableComponentProps<IHpTimeSeriesChartScss>, IHpTimeSeriesChartState, IHpTimeSeriesChartScss> {
  constructor(props: IHpTimeSeriesChartProps) {
    super(props);
    this.state = {
      scss: props.scss
    }
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