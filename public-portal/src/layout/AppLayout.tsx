import Header from "@/components/Header"
import { Box } from "@mui/material"
import { Outlet } from "react-router-dom"

const AppLayout = () => {
  return (
    <Box>
      <Box>
        <Header />
      </Box>
      <Box>
        <Outlet/>
      </Box>
    </Box>
  )
}

export default AppLayout