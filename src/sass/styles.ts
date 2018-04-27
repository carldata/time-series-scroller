import { IResizableScssGeneric } from "../hocs/scss";

export interface IHpSliderScssGeneric<T extends string|number> extends IResizableScssGeneric<T> {
  handleWidthPx: T;
}

export type IHpSliderScss = IHpSliderScssGeneric<number>;

export const convertHpSliderScss = (source: IHpSliderScssGeneric<string>): IHpSliderScssGeneric<number> => { 
  return {
    handleWidthPx: parseInt(source.handleWidthPx),
    heightPx: parseInt(source.heightPx),
    widthPx: parseInt(source.widthPx)
  }
}

export interface IHpTimeSeriesChartScssGeneric<T extends string|number> extends IResizableScssGeneric<T> {
  paddingBottomPx: T;
  paddingLeftPx: T;
  paddingRightPx: T;
  paddingTopPx: T;
}

export const convertHpTimeSeriesChartScss = (source: IHpTimeSeriesChartScssGeneric<string>): IHpTimeSeriesChartScssGeneric<number> => { 
  return {
    widthPx: parseInt(source.widthPx),
    heightPx: parseInt(source.heightPx),
    paddingBottomPx: parseInt(source.paddingBottomPx),
    paddingLeftPx: parseInt(source.paddingLeftPx),
    paddingRightPx: parseInt(source.paddingRightPx),
    paddingTopPx: parseInt(source.paddingTopPx)
  }
}

export type IHpTimeSeriesChartScss = IHpTimeSeriesChartScssGeneric<number>;