import * as _ from 'lodash';
import * as React from 'react';
import { IHpResizableScss } from '../sass/styles';

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

export interface IHpResizeableComponentProps<TCSS> {
  fitToParent?: IParentSizeFitParamaters;
  scss: TCSS;
}

export interface IHpResizeableComponentState {
  scss: IHpResizableScss;
}

export abstract class HpResizeableComponent<P extends IHpResizeableComponentProps<TCSS>, S extends IHpResizeableComponentState, TCSS extends IHpResizableScss> extends React.Component<P, S> {
  protected parentElement: HTMLElement = null;

  private fitToParentWidth = (): boolean => _.isObject(this.props.fitToParent) && _.isBoolean(this.props.fitToParent.toWidth) && this.props.fitToParent.toWidth;
  private fitToParentHeight = (): boolean => _.isObject(this.props.fitToParent) && _.isBoolean(this.props.fitToParent.toHeight) && this.props.fitToParent.toHeight;

  private fitToParentWidthOffset = (): number => _.isObject(this.props.fitToParent) && _.isNumber(this.props.fitToParent.offsetWidth) ? this.props.fitToParent.offsetWidth : 0;
  private fitToParentHeightOffset = (): number => _.isObject(this.props.fitToParent) && _.isNumber(this.props.fitToParent.offsetHeight) ? this.props.fitToParent.offsetHeight : 0;

  protected resizeCallback = () => {
    if (_.isObject(this.parentElement)) {
      if (this.fitToParentWidth()) {
        this.setState({
          scss: _.extend(this.state.scss, {
            widthPx: this.parentElement.clientWidth - this.fitToParentWidthOffset(),
          } as IHpResizableScss)
        });
      }
      if (this.fitToParentHeight()) {
        this.setState({
          scss: _.extend(this.state.scss, {
            heightPx: this.parentElement.clientHeight - this.fitToParentHeightOffset(),
          } as IHpResizableScss)
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

  public componentWillReceiveProps(nextProps: Readonly<IHpResizeableComponentProps<TCSS>>, nextContext: any) {
    this.setState({
      scss: _.extend(nextProps.scss, {
        widthPx: this.fitToParentWidth() ? this.parentElement.clientWidth - this.fitToParentWidthOffset() : nextProps.scss.widthPx,
        heightPx: this.fitToParentHeight() ? this.parentElement.clientWidth - this.fitToParentHeightOffset() : nextProps.scss.heightPx,
      })
    });
  }
}