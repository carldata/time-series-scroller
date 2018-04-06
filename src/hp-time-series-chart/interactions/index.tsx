export interface IInteractions {
  mouseButtonDown?: (unix: number) => void;
  mouseButtonUp?: (unix: number) => void;
  mouseMoved?: (unix: number) => void;
}