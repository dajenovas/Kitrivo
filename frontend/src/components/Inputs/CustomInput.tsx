import type { CustomInputProps } from "@/types/input.types";
import { TextField } from "@mui/material";


export const CustomInput = ({ placeholder, width, value, onChange, height, isDisabled, bgc, borderA, type, onKeyDown, minRow, maxRow }: CustomInputProps) => {
  return (
    <TextField disabled={isDisabled} placeholder={placeholder} variant="outlined" value={value} onChange={onChange} onKeyDown={onKeyDown} type={type}
    minRows={minRow} maxRows={maxRow} multiline={minRow ? true : false}
      sx={{
        width: width || "100%", backgroundColor: bgc || "transparent", borderRadius: "8px", border: "none",
        "& .MuiOutlinedInput-notchedOutline": { border: borderA || `1px solid #CFCFCF` },
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px", border: "none",
          "&:hover fieldset": { border: borderA || "1px solid #CFCFCF" },
          "&.Mui-focused fieldset": { border: borderA || "1px solid #CFCFCF" },
        },
        // Input text
        "& input": { height: height || "30px", padding: "10px 20px", fontSize: "14px", border: "none", }
      }}
    />
  );
};
