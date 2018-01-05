import { IDomain, IHpSliderScreenDimensions } from './interfaces';
import { EnumHandleType } from './enums';
import * as _ from 'lodash';

let translateValueToHandleLeftPositionPx = (domain: IDomain<number>, dimensions: IHpSliderScreenDimensions, type: EnumHandleType, value: number): number => {
  let result = (value / domain.domainMax - domain.domainMin) * dimensions.sliderWidthPx;
  if (type == EnumHandleType.Right)
    result -= dimensions.sliderHandleWidthThicknessPx;
  return _.isNaN(result) ? 0 : result;
}

/**
 * Translates length provided in pixels to an equivalent expressed in domain units
 */
let expressLengthPxInDomain = (domain: IDomain<number>, dimensions: IHpSliderScreenDimensions, lengthPx: number): number => {
  return (lengthPx / dimensions.sliderWidthPx) * (domain.domainMax - domain.domainMin);
}

let expressDomainLengthInPx = (domain: IDomain<number>, dimensions: IHpSliderScreenDimensions, length: number): number => {
  return _.reduce([(length / (domain.domainMax - domain.domainMin) * dimensions.sliderWidthPx)], 
                  (sum, el) => _.isNaN(el) ? 0 : el, 
                  0);
}

export let calculations = {
  translateValueToHandleLeftPositionPx,
  expressLengthPxInDomain,
  expressDomainLengthInPx
}