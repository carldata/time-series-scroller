import { IDomain, IHpSliderScreenDimensions } from './interfaces';
import { EnumHandleType } from './enums';

let translateValueToHandleLeftPositionPx = (domain: IDomain<number>, dimensions: IHpSliderScreenDimensions, type: EnumHandleType, value: number): number => {
  let result = (value / (domain.domainMax - domain.domainMin)) * dimensions.sliderWidthPx;
  if (type == EnumHandleType.Right)
    result -= dimensions.sliderHandleWidthThicknessPx;
  return result;  
}

/**
 * Translates length provided in pixels to an equivalent expressed in domain units
 */
let expressLengthPxInDomain = (domain: IDomain<number>, dimensions: IHpSliderScreenDimensions, lengthPx: number): number => {
  return (lengthPx / dimensions.sliderWidthPx) * (domain.domainMax - domain.domainMin);
}

let expressDomainLengthInPx = (domain: IDomain<number>, dimensions: IHpSliderScreenDimensions, length: number): number => {
  return (length / (domain.domainMax - domain.domainMin) * dimensions.sliderWidthPx);
}

export let calculations = {
  translateValueToHandleLeftPositionPx,
  expressLengthPxInDomain,
  expressDomainLengthInPx
}