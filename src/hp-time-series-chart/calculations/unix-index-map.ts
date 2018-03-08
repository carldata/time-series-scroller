/**
 * Module responsible for preformance improvements when browsing / scrolling data.
 * 
 * The main task of this module is to generate an optimization structure of Map<number, number> where:
 * a) key - unix timestamp,
 * b) value - index indicating a point in array of allPoints: IUnixTimePoint[]
 * 
 * If:
 * a) quite large data series are loaded, there are no additional, 
 * "ahead of time data" structures created - only ad-hoc buckets; 
 * note there as many buckets as there are on screen pixel columns on SVG time series chart. 
 * 
 * b) the view is narrowed to see only a fraction of the series,  
 * ad-hoc buckets must be created; it is good to know from which index to 
 * start from when building buckets for a given unix timestap.
 */

import * as  _ from "lodash";
import { IUnixTimePoint } from "../state/unix-time-point";
import { ITimeSeriesBucket } from "./interfaces";

export const MAX_UNIX_INDEX_MAP_BUCKET_SIZE = 10000;

interface IUnixIndexMapParameters {
  unixFrom: number;
  length: number;
  bucketLengthUnix: number;
}

const calculateMapParameters = (allPoints: IUnixTimePoint[]): IUnixIndexMapParameters => {
  const length = MAX_UNIX_INDEX_MAP_BUCKET_SIZE;
  return <IUnixIndexMapParameters> {
    unixFrom: _.isObject(_.first(allPoints)) ? _.first(allPoints).unix : 0,
    length: length, 
    bucketLengthUnix: (_.last(allPoints).unix - _.first(allPoints).unix) / length
  }
}

/**
 * Return an index in allPoints array, indicating an existing point p: IUnixTimePoint, meeting two conditions:
 * a) it is available as a value in pre-created unixToIndexMap (key, value),
 * b) the point found in allPoints array is the first one having 
 *    p.unix >= browseFromUnix
 * @param allPoints all data available
 * @param unixToIndexMap pre-calculated map 
 * @param browseFromUnix 
 */
const findIndexToBrowsePointsFrom = (allPoints: IUnixTimePoint[],
                                     unixToIndexMap: Map<number, number>,
                                     browseFromUnix: number): number => {
  let mapParameters = calculateMapParameters(allPoints);
  let unix =  mapParameters.unixFrom + _.floor((browseFromUnix - mapParameters.unixFrom)/
                                       mapParameters.bucketLengthUnix)*mapParameters.bucketLengthUnix;
  return unixToIndexMap.get(unix) || 0;
}

const findFirstIndexMeetingUnixFrom = (allPoints: IUnixTimePoint[], unixFrom: number, lastIndex: number): number => {
  for (let i=lastIndex; i < allPoints.length-1; i++) {
    if (allPoints[i].unix >= unixFrom)
      return i;
  }
  return 0;
}

/**
 * Creates a Map used for browse/scroll speed optimizations
 */
const createUnixToIndexMap = (allPoints: IUnixTimePoint[]): Map<number, number> => {
  let result: Map<number, number> = new Map();
  if (allPoints.length == 0)
    return result;
  let parameters = calculateMapParameters(allPoints);
  let firstUnixFrom = _.first(allPoints).unix;
  let indexOfElement = 0;
  for (let i=0; i < parameters.length; i++) {
    let unixFrom = firstUnixFrom + i*parameters.bucketLengthUnix;
    let unixTo = firstUnixFrom + (i+1)*parameters.bucketLengthUnix;
    indexOfElement = findFirstIndexMeetingUnixFrom(allPoints, unixFrom, indexOfElement);
    result.set(unixFrom, indexOfElement);
  }
  return result;
}

export const unixIndexMapCalculations = {
  createUnixToIndexMap,
  findIndexToBrowsePointsFrom
}