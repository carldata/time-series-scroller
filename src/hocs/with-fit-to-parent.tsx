import * as _ from 'lodash';
import * as React from 'react';
import { IResizableScss } from './scss';

interface IWithFitToParentState {
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
    private parentElement: any = null;

    private fitToParentWidth = (): boolean => _.isObject(this.props.fitToParent) && _.isBoolean(this.props.fitToParent.toWidth) && this.props.fitToParent.toWidth;
    private fitToParentHeight = (): boolean => _.isObject(this.props.fitToParent) && _.isBoolean(this.props.fitToParent.toHeight) && this.props.fitToParent.toHeight;
  
    private fitToParentWidthOffset = (): number => _.isObject(this.props.fitToParent) && _.isNumber(this.props.fitToParent.offsetWidth) ? this.props.fitToParent.offsetWidth : 0;
    private fitToParentHeightOffset = (): number => _.isObject(this.props.fitToParent) && _.isNumber(this.props.fitToParent.offsetHeight) ? this.props.fitToParent.offsetHeight : 0;

    constructor(props: P & IWithFitToParentProps) {
      super(props);
      this.state = {
        width: props.scss.widthPx,
        height: props.scss.heightPx,
      };
    }

    protected resizeCallback = () => {
      if (_.isObject(this.parentElement)) {
        if (this.fitToParentWidth()) {
          this.setState({ width: this.parentElement.clientWidth - this.fitToParentWidthOffset() });
        }
        if (this.fitToParentHeight()) {
          this.setState({ height: this.parentElement.clientHeight - this.fitToParentHeightOffset() });
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
  
    public render(): JSX.Element {
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