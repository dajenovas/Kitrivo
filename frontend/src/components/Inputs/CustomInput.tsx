import React from "react";
import type { CustomInputProps } from "@/types/input.types";
import { TextField } from "@mui/material";
import { THEME } from "@/assets/theme";

export const CustomInput: React.FC<CustomInputProps> = ({ placeholder, width, value, onChange, height, isDisabled, disabled, bgc, borderA, type = "text", onKeyDown, minRow, maxRow, multiline, rows, label, error, helperText, InputProps, InputLabelProps, SelectProps, autoFocus, size = "small", fullWidth = true, required, select, name, defaultValue, inputRef, sx, children, ...rest }) => {
  const isInputDisabled = disabled !== undefined ? disabled : isDisabled;
  const isError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : helperText;

  return (
    <TextField fullWidth={fullWidth} disabled={isInputDisabled} placeholder={placeholder} variant="outlined" value={value} onChange={onChange} onKeyDown={onKeyDown} type={type} label={label} name={name} defaultValue={defaultValue} inputRef={inputRef} error={isError} helperText={errorMessage} InputProps={InputProps} InputLabelProps={InputLabelProps} SelectProps={SelectProps} autoFocus={autoFocus} size={size} required={required} select={select} multiline={multiline || minRow !== undefined} minRows={minRow || rows} maxRows={maxRow} rows={rows} sx={{ width: width || (fullWidth ? "100%" : undefined), backgroundColor: bgc || "transparent", borderRadius: "8px", "& .MuiOutlinedInput-notchedOutline": { border: borderA || (isError ? undefined : `1px solid ${THEME.border}`) }, "& .MuiOutlinedInput-root": { borderRadius: "8px", "&:hover fieldset": { border: borderA }, "&.Mui-focused fieldset": { border: borderA } }, ...sx }} {...rest}>
      {children}
    </TextField>
  );
};

export default CustomInput;
