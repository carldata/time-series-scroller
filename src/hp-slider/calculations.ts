import { IDomain } from './interfaces';
import { EnumHandleType } from './enums';
import * as _ from 'lodash';
import { IHpSliderScss, IHpSliderScssGeneric } from '../sass/styles';

let translateValueToHandleLeftPositionPx = (domain: IDomain<number>, scss: IHpSliderScss , type: EnumHandleType, value: number): number => {
  let result = (value - domain.domainMin) / (domain.domainMax - domain.domainMin) * scss.widthPx;
  if (type == EnumHandleType.Right)
    result -= scss.handleWidthPx;
  return _.isNaN(result) ? 0 : result;
}

/**
 * Translates length provided in pixels to an equivalent expressed in domain units
 */
let expressLengthPxInDomain = (domain: IDomain<number>, scss: IHpSliderScss, lengthPx: number): number => {
  return (lengthPx / scss.widthPx) * (domain.domainMax - domain.domainMin);
}

let expressDomainLengthInPx = (domain: IDomain<number>, scss: IHpSliderScss, length: number): number => {
  return _.reduce([(length / (domain.domainMax - domain.domainMin) * scss.widthPx)], 
                  (sum, el) => _.isNaN(el) ? 0 : el, 
                  0);
}

export let calculations = {
  translateValueToHandleLeftPositionPx,
  expressLengthPxInDomain,
  expressDomainLengthInPx
}