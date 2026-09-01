export interface WheelOption {
  id: string;
  text: string;
  color: string;
}

export interface DecisionWheel {
  id: string;
  title: string;
  titleTa?: string;
  icon?: string;
  options: WheelOption[];
  createdAt: string;
}

export interface DecisionResult {
  id: string;
  wheelId: string;
  wheelTitle: string;
  selectedOption: string;
  optionColor: string;
  timestamp: string;
}
