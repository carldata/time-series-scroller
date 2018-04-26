import * as _ from 'lodash';
import * as React from 'react';
import { HpSliderBase, IHpSliderBaseProps } from './base-component';
import { IHpSliderScss } from '../sass/styles';
import { HpBaseComponent, IHpBaseComponentProps, IHpBaseComponentState } from '../hp-base-component';

export interface IHpSliderProps extends IHpSliderBaseProps, IHpBaseComponentProps<IHpSliderScss> {
}

interface IHpTimeSeriesChartState extends IHpBaseComponentState {
  scss: IHpSliderScss;
}

export class HpSlider extends HpBaseComponent<IHpSliderBaseProps & IHpBaseComponentProps<IHpSliderScss>, IHpTimeSeriesChartState, IHpSliderScss> {
  constructor(props: IHpSliderProps) {
    super(props);
    this.state = {
      scss: props.scss
    }
  }

  public render() {
    return <HpSliderBase
      parentCallback={(div) => {
        if (!_.isObject(this.parentElement) && _.isObject(div)) {
          this.parentElement = div.parentElement;
          this.resizeCallback();
      }}}
      {...this.props}
      scss={this.state.scss}
    />;
  }
}