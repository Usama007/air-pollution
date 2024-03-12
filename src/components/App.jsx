import { Box, Button, Card, CardActions, CardContent, Container, Grid, Typography } from '@mui/material'
import React, { useState } from 'react'
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from './Header';

import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import Feed from './Feed';
import Map from './Map';
import { useDebounce } from '../hooks';


const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: 'RobotoBold, Arial',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
      @font-face {
        font-family: 'RobotoBold';
      }
      `
    }
  }

});


export default function App() {
  const [searchedCity, setsearchedCity] = useState('Edmonton')
  const doSearch = useDebounce((term) => {
    setsearchedCity(term)
  }, 500);

  const handleChange = (e) => {
    const value = e.target.value;
    doSearch(value);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: "flex", flexDirection: 'column', alignItems: 'center' ,mb: 1}}>
        <CssBaseline />
        {/* <Header /> */}
        <main >
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center',mt:5, mb: 1,width: 1200 }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search City"
              onChange={handleChange}
              inputProps={{ 'aria-label': 'search city' }}
            />
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          <Grid container spacing={2} >
            <Grid item xs={5}>
              <Feed city={searchedCity}/>
            </Grid>
            <Grid item xs={7}>
              <Map city={searchedCity} />
            </Grid>
          </Grid>



        </main>
      </Box>
    </ThemeProvider>
  )
}
