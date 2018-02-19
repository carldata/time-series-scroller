# time-series-scroller

Specialized time-series-over-domain component focused on code quality and performance. 
This is 100% functional product, yet not mature - still beta/under development (see project goals below). 

## Getting started with the development version

```
git clone https://github.com/carldata/time-series-scroller.git
cd time-series-scroller
npm i
npm run dev
```

Everything succeeded, you should be seeing this:

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/yALqQtGD_Ak/0.jpg)](https://www.youtube.com/watch?v=yALqQtGD_Ak)

## Getting started with the npm-dependency

```
npm i time-series-scroller --save-dev
```

## Project goals

- [x] High performance
- [x] High maintainabilty
- [x] High specialization (time series only !)
- [ ] Good documentation
- [ ] 100% test coverage
- [ ] Wrappers to other frameworks

## Description

Simple, highly performant and customizable React/Redux module for displaying time series. When dug deeper, consists of the following components:
- [HpSlider](src/hp-slider/index.tsx) "scrollbar" for scrolling/selecting a piece of domain
- [HpTimeSeriesChart](src/hp-time-series-chart/index.tsx) for displaying time series in the domain
- [HpTimeSeriesScroller](src/time-series-scroller.tsx) incorporating the two above components into one. 

Note that each of the components can be used separately for different purposes :) Eg. HpSlider can be used straight-away to control a temperature or humidity in an air-conditioning online controlling system :) HpTimeSeriesScroller component can be seen as a demo how HpSlider and HpTimeSeriesChart can interact - keep in mind HpTimeSeriesScroller is a fully stateful component that (currently) does not provide means to share the internal state with a Redux store. If you are not OK with this, write your own version !

## Glossary
- domain - an number (from/to) range; keep in mind HpSlider, HpTimeSeriesChart components do not work on date-time values like "2015-03-04 12:45:40", but numbers (integers) translated from date-time values - it is quite easy to do this kind of conversion in JavaScript by calling [Date.prototype.getTime](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setTime)
- hp = high performant

## Exposing as npm package:

In src folder run:
```
tsc --jsx react --listEmittedFiles --declaration --outDir build
```


