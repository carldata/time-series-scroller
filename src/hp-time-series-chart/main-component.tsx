import * as _ from 'lodash';
import * as React from 'react';
import { IHpTimeSeriesChartBaseProps, HpTimeSeriesChartBase } from './base-component';
import { IHpTimeSeriesChartScss } from '../sass/styles';
import { HpBaseComponent, IHpBaseComponentProps, IHpBaseComponentState } from '../hp-base-component';

export interface IHpTimeSeriesChartProps extends IHpTimeSeriesChartBaseProps, IHpBaseComponentProps<IHpTimeSeriesChartScss> {
}

interface IHpTimeSeriesChartState extends IHpBaseComponentState {
  /**
   * Since there are fitToParentWidth, fitToParentHeight props, 
   * we could keep recommended width/height in state only.
   * However, it is much more convenient to store it in scss object -
   * this is why IHpTimeSeriesChartScss is stored in state.
   */
  scss: IHpTimeSeriesChartScss;
}

export class HpTimeSeriesChart extends HpBaseComponent<IHpTimeSeriesChartBaseProps & IHpBaseComponentProps<IHpTimeSeriesChartScss>, IHpTimeSeriesChartState, IHpTimeSeriesChartScss> {
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