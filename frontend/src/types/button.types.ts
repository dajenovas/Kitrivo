// Custom Button
export interface CustomButtonProps {
  text?: string;
  width?: string | number;
  height?: string | number;
  font?: string | number;
  onClick?: (e?: React.MouseEvent) => void;
  borderRadius?: string | number;
  isDisabled?: boolean;
  bgc?: string;
  color?: string;

  Sicon?: React.ReactNode | string;
  Eicon?: React.ReactNode | string;
  boxShad?: string;
  border?: string;
  hov?: string;
  hovBoxShad?: string;
  hoverTextColor?: string;
  type?: "button" | "submit" | "reset";
};