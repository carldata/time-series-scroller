export interface IDateTimePoint {
  /**
   * Real sample value
   */
  value: number;

  date: Date;
  
  /**
   * The number of seconds since the Unix Epoch - effect of calling MomentJS unix() method on value
   */
  unix: number;

  /**
   * Minimal envelope value (for IDateTimePoint objects resampled/that represent many samples)
   */
  envelopeValueMin: number;
  /**
   * Maximal envelope value (for IDateTimePoint objects resampled/that represent many samples)
   */
  envelopeValueMax: number;

  /**
   * If true, below time series chart there will be a marker indicating 
   * that for a a date there an event (something) happened
   * 
   * TODO: events should be just a separte time series ! 
   */
  event: boolean;
}