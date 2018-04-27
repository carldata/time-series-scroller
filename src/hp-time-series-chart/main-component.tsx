import * as _ from 'lodash';
import * as React from 'react';
import { IHpTimeSeriesChartBaseProps, HpTimeSeriesChartBase } from './base-component';
import { IHpTimeSeriesChartScss } from '../sass/styles';
import { withFitToParent } from '../hocs/with-fit-to-parent';
import { IWithFitToParentProps } from '..';

export const HpTimeSeriesChart: React.ComponentClass<IHpTimeSeriesChartBaseProps & IWithFitToParentProps> = withFitToParent<IHpTimeSeriesChartBaseProps>(HpTimeSeriesChartBase);