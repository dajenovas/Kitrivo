import { BOXSHADOW, FONTSIZE, THEME } from "@/assets/theme"
import { CustomButton } from "@/components/Buttons/CustomButton"
import { CustomInput } from "@/components/Inputs/CustomInput"
import { AuthService } from "@/services/auth.service"
import { Alert, Box, Snackbar, Typography } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const LoginPage = () => {

    const navigate = useNavigate();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error"; }>({ open: false, message: "", severity: "success" });
    const credentials = { username, password }

    const login = async () => {
        if (!username.trim() || !password.trim()) {
            setSnackbar({ open: true, message: "Please enter both username and password.", severity: "error" });
            return;
        }
        try {
            await AuthService.login(credentials);
            setSnackbar({ open: true, message: "Login successful!", severity: "success" });
            setTimeout(() => { navigate("/dashboard"); }, 800);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || "Login failed. Please check your credentials.";
            setSnackbar({ open: true, message: message, severity: "error" });
        }
    }

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }

    return (
        <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Box width={'50%'} height={'100vh'} sx={{ backgroundImage: 'url(./Login.png)' }} />
            <Box margin={3} width={'50%'} display={'flex'} justifyContent={'center'} alignContent={'center'}>
                <Box width={"70%"} border={`1px solid ${THEME.border}`} padding={5} borderRadius={6} boxShadow={BOXSHADOW} bgcolor={THEME.background} >
                    <Box mb={4}>
                        <Typography fontSize={FONTSIZE.heading} textAlign={'center'}>Login</Typography>
                    </Box>
                    <Box>
                        <Typography fontSize={FONTSIZE.small}>Username</Typography>
                        <CustomInput placeholder="Enter your username or email" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </Box>
                    <Box mt={4}>
                        <Typography fontSize={FONTSIZE.small}>Password</Typography>
                        <CustomInput placeholder="Enter your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </Box>
                    <Box mt={6} display={'flex'} justifyContent={'center'}>
                        <CustomButton width={180} text="Login" onClick={login} />
                    </Box>
                </Box>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default LoginPage
