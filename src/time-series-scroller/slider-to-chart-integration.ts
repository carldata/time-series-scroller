import * as _ from "lodash";
import { EnumHandleType } from "..";

export type UnixFromTo = { windowUnixFrom: number, windowUnixTo: number };

export const handleMovedCallback = (value: number | number[], type: EnumHandleType, state: UnixFromTo): UnixFromTo => {
  let newUnixFrom = state.windowUnixFrom;
  let newUnixTo = state.windowUnixTo;
  switch (type) {
    case EnumHandleType.Left:
      newUnixFrom = _.isNumber(value) ? value : 0;
      break;
    case EnumHandleType.Right:
      newUnixTo = _.isNumber(value) ? value : 0;
      break;
    case EnumHandleType.DragBar:
      newUnixFrom = _.isArray(value) ? value[0] : 0
      newUnixTo = _.isArray(value) ? value[1] : 0
      break;
  }
  return {
    windowUnixFrom: newUnixFrom,
    windowUnixTo: newUnixTo,
  } as UnixFromTo;
}