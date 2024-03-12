import React from 'react'
import { AppBar,  Toolbar, Typography } from '@mui/material'

export default function Header() {
    return (
        <AppBar position="static" sx={{ mb: 10 }}>
            <Toolbar>
                <Typography
                    variant="h4"
                    sx={{ fontSize: { xs: 16, sm: 20 } }}

                >
                    Air Pollution
                </Typography>

            </Toolbar>
        </AppBar>
    )
}
