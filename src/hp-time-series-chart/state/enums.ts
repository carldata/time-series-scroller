export enum EnumChartPointsSelectionMode {
  NoSelection,
  SelectUnselectSingle,
  SelectMultiple,
  UnselectMultiple
}

export enum EnumZoomSelected {
  NoZoom,
  ZoomLevel1,
  ZoomLevel2
}

export enum EnumTimeSeriesDisplayStyle {
  /**
   * Default mode. Please read descriptions of PointsOnly, LineOnly
   */
  PointsAndLine,

  /**
   * If active, chart, for a time series, will draw points only - 
   * provided rFactor is small enough to enable displaying particular points.
   * 
   * A good choice for series containing incomplete / additional feedback data.
   */
  PointsOnly,
  
  /**
   * If active, chart will draw line for a time series only - even in 
   * EnumChartPointsSelectionMode.SelectUnselectSingle,
   * EnumChartPointsSelectionMode.SelectMultiple,
   * EnumChartPointsSelectionMode.UnselectMultiple
   * modes, making these modes useless (in context of time series, that have this option chosen)
   */
  LineOnly
}