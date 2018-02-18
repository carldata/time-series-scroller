/**
 * Represents a linear domain with minimal / maximal values
 */
export interface IDomain<T> {
  domainMin: T;
  domainMax: T;  
}

export interface IHpSliderHandleValues<T> {
  left: T;
  right: T;
}