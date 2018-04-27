import { withFitToParent, IResizeableComponentProps, IWithFitToParentProps } from "..";
import { IHpSliderBaseProps, HpSliderBase } from "./base-component";

export const HpSlider: React.ComponentClass<IHpSliderBaseProps & IWithFitToParentProps> = withFitToParent<IHpSliderBaseProps>(HpSliderBase);