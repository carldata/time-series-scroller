export interface IResizableScssGeneric<T extends string|number> {
  widthPx: T;
  heightPx: T;
}

export type IResizableScss = IResizableScssGeneric<number>;