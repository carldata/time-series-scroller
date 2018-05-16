[![Build status](https://travis-ci.org/carldata/time-series-scroller.svg?branch=master)](https://travis-ci.org/carldata/time-series-scroller)

# time-series-scroller

Specialized time-series-over-domain component focused on code quality and performance. 
100% functional, yet not mature - still beta/under development (see project goals below).
All components are written from scratch using D3 and primitive HTML elements, 
this is not a wrapper over a third-party library.

## Getting started with the development version

```
git clone https://github.com/carldata/time-series-scroller.git
cd time-series-scroller
npm i
npm run dev
```

## Demo

[See it in action !](https://carldata.github.io/time-series-scroller/demo/)

## Getting started with the npm-dependency

```
npm i time-series-scroller --save-dev
```

## Project goals

- [x] High performance (works with 2M points)
- [x] High maintainabilty
- [x] Simplicity (KISS+DRY)
- [x] High specialization (time series only !)
- [x] SCSS variables imported as variables in JavaScript
- [x] SCSS variables defining attributes / data structures for styling
- [ ] [StoryBook](https://storybook.js.org/) demonstrations
- [ ] Zooming in/out redesigned
- [ ] Documentation
  - [ ] reusable actions/reducers
  - [ ] how to integrate
  - [ ] bucketing algorithm
  - [ ] how to draw in D3, problems encountered
- [ ] 100% test coverage
- [ ] Wrappers to / means of integration with the other frameworks (AngularJS, AngualarIO, Vue etc.)

## Description

Simple, highly performant and customizable React/Redux module for displaying time series. When dug deeper, consists of the following components:
- [HpSlider](src/hp-slider/index.tsx) "scrollbar" for scrolling/selecting a piece of domain
- [HpTimeSeriesChart](src/hp-time-series-chart/index.tsx) for displaying time series in the domain
- [HpTimeSeriesScroller](src/time-series-scroller.tsx) incorporating the two above components into one. 

Note that each of the components can be used separately for different purposes :) Eg. HpSlider can be used straight-away to control a temperature or humidity in an air-conditioning online controlling system :) HpTimeSeriesScroller component can be seen as a demo how HpSlider and HpTimeSeriesChart can interact - keep in mind HpTimeSeriesScroller is a fully stateful component that (currently) does not provide means to share the internal state with a Redux store. If you are not OK with this, write your own version !

## Glossary
- domain - an (inclusive) range of integer numbers (from/to); keep in mind HpSlider, HpTimeSeriesChart components do not work on date-time values like "2015-03-04 12:45:40", but numbers (integers) translated from date-time values - it is quite easy to do this kind of conversion in JavaScript by calling [Date.prototype.getTime](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setTime)
- hp = high performant

## Testing

```
npm run test
```

Currently it checks the bucketing algorithm calculations:

```
 PASS  __tests__/time-series-chart/calculations.ts
  time-series-chart calculations test
    ✓ evenly distributed time series is placed into buckets properly (18ms)
    ✓ time series is transformed to no empty buckets (6ms)
    ✓ buckets are fed with proper data (17ms)
    ✓ not-evenly distributed series gets transformed to buckets under specific filter conditions - test A (6ms)
    ✓ not-evenly distributed series gets transformed to buckets under specific filter conditions - test B (2ms)
    ✓ not-evenly distributed series has no buckets but shadow buckets get found (8ms)

  console.log __tests__/time-series-chart/calculations.ts:31
    Running with hours: 17, distribution: 15, numberOfBuckets: 275

  console.log __tests__/time-series-chart/calculations.ts:48
    Running with minutes: 557, numberOfBuckets: 8, division: 5

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total

```

## Exposing as npm package:

In src folder run:
```javascript
grunt --os=osx //mac
grunt --os=win //windows
```

then 
```javascript
npm version patch
```