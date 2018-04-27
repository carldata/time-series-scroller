import * as _ from 'lodash';
import * as React from 'react';
import { IResizableScss } from './scss';

export interface IWithFitToParentState {
  width: number;
  height: number;
}

export interface IParentSizeFitParamaters {
  toWidth?: boolean;
  toHeight?: boolean;
  /**
   * If fitToParentWidth is true, defines the offset of width that will be substracted
   * from parent HTML client width and set as the final width
   */
  offsetWidth?: number;
  /**
   * If fitToParentWidth is true, defines the offset of height that will be substracted
   * from parent HTML client height and set as the final height
   */
  offsetHeight?: number;
}

export interface IWithFitToParentProps {
  fitToParent?: IParentSizeFitParamaters;
}

export interface IResizeableComponentProps {
  scss: IResizableScss;
  refCallback?: (ref: any) => void;
}

export function withFitToParent<P extends IResizeableComponentProps>(WrappedComponent: React.ComponentClass<IResizeableComponentProps>|
                                                                                       React.StatelessComponent<IResizeableComponentProps>) {
  return class extends React.Component<P & IWithFitToParentProps, IWithFitToParentState> {
    parentElement: any = null;

    constructor(props: P & IWithFitToParentProps) {
      super(props);
      this.state = {
        width: props.scss.widthPx,
        height: props.scss.heightPx,
      };
    }

    resizeCallback = () => {
      const fitToParentWidth = (): boolean => _.isObject(this.props.fitToParent) && _.isBoolean(this.props.fitToParent.toWidth) && this.props.fitToParent.toWidth;
      const fitToParentHeight = (): boolean => _.isObject(this.props.fitToParent) && _.isBoolean(this.props.fitToParent.toHeight) && this.props.fitToParent.toHeight;
    
      const fitToParentWidthOffset = (): number => _.isObject(this.props.fitToParent) && _.isNumber(this.props.fitToParent.offsetWidth) ? this.props.fitToParent.offsetWidth : 0;
      const fitToParentHeightOffset = (): number => _.isObject(this.props.fitToParent) && _.isNumber(this.props.fitToParent.offsetHeight) ? this.props.fitToParent.offsetHeight : 0;
  
      if (_.isObject(this.parentElement)) {
        if (fitToParentWidth()) {
          this.setState({ width: this.parentElement.clientWidth - fitToParentWidthOffset() });
        }
        if (fitToParentHeight()) {
          this.setState({ height: this.parentElement.clientHeight - fitToParentHeightOffset() });
        }
      }
    }
  
    componentWillMount() {
      this.resizeCallback();
    }
  
    componentDidMount() {
      window.addEventListener("resize", this.resizeCallback);
      this.resizeCallback();
    }
    
    componentWillUnmount() {
      window.removeEventListener("resize", this.resizeCallback);
    }
  
    render(): JSX.Element {
      return <WrappedComponent
        {...this.props}
        scss={_.extend(this.props.scss, {
          widthPx: this.state.width,
          heightPx: this.state.height,
        })}
        refCallback={(ref) => {
          if (!_.isObject(this.parentElement) && _.isObject(ref)) {
            this.parentElement = ref.parentElement;
            this.resizeCallback();
          }
        }
      } />;
    }
  };
}