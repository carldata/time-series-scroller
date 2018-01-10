export interface IUnixTimePoint {
  /**
   * The number of seconds since the Unix Epoch - effect of calling MomentJS unix() method on value
   */
  unix: number;
  
  /**
   * Real sample value
   */
  value: number;
}