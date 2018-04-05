export interface IInteractions {
  mouseButtonDown: (unix: number) => void;
  mouseButtonUp: (unix: number) => void;
  mouseMoved: (unix: number) => void;
}

export const registerInteractionsCallbacks = (el: SVGSVGElement) => {
  el.onmouseup = (ev) => console.log(ev.offsetX);
}