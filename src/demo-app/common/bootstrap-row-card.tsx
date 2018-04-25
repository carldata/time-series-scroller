import * as _ from "lodash";
import * as React from "react";

export interface IBootstrapRowCardProps extends React.Props<string> {
  additionalCssStyle: string;
  title: string;
  subtitle?: string;
}

export const BoostrapRowCard = (props: IBootstrapRowCardProps) => {
  const className = `col card ${props.additionalCssStyle}`;
  return (<div className='row'>
    <div className={className}>
      <div className="card-body">
        <div className="card-title"><h5>{props.title}</h5>
          {_.isString(props.subtitle) && 
            <small className="form-text text-white">{props.subtitle}</small>}
        </div>
        {_.isObject(props.children) && <div className="card-text">{props.children}</div>}
      </div>
    </div>
  </div>);
}
