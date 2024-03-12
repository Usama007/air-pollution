import { Alert, Card, CardContent, Grid, Typography } from '@mui/material'
import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);


export default function Feed({ city }) {
    const [feedResponse, setfeedResponse] = useState(null)
    const [apiResponse, setapiResponse] = useState(null)
    const [historicalData, setHistoricalData] = useState(null);

    const apiKey = 'f4e22f28356e42a6a9536e18a55633b3';



    useEffect(() => {
        fetchData()
    }, [city]);

    const fetchData = async () => {
        const respose = await axios.get(`https://api.waqi.info/feed/${city}/?token=e9cb8cfe77f56438efccb60cd5eb4cea4506e8ee`)
        if (respose?.status === 200) {
            setfeedResponse(respose?.data?.data)
            setapiResponse(respose?.data)
            getWeatherbit(respose?.data?.data?.city?.geo?.[0], respose?.data?.data?.city?.geo?.[1])
        }
    }

    const getWeatherbit = async (lat, lon) => {
        const respose = await axios.get(`https://api.weatherbit.io/v2.0/history/airquality?lat=${lat}&lon=${lon}&start_date=2024-03-08&end_date=2024-03-09&tz=local&key=${apiKey}`)
        if (respose?.status === 200) {
            setHistoricalData(respose?.data?.data);
        }
    }


    const getBgColor = () => {

        if (feedResponse?.aqi <= 50) {
            return '#009966'

        } else if (feedResponse?.aqi >= 51 && feedResponse?.aqi <= 100) {
            return '#ffde33'


        } else if (feedResponse?.aqi >= 101 && feedResponse?.aqi <= 150) {
            return '#ff9933'

        } else if (feedResponse?.aqi >= 151 && feedResponse?.aqi <= 200) {
            return '#cc0033'

        } else if (feedResponse?.aqi >= 201 && feedResponse?.aqi <= 300) {
            return '#660099'

        } else if (feedResponse?.aqi >= 300) {
            return '#7e0023'

        }
    }

    const getChartColor = (value, type) => {

        if (value <= 4 || type === 'o3' || type === 'no2' || type === 'so2' || type === 'co') {
            return '#009966'

        } else if (value >= 5 && value < 10) {
            return '#ffde33'
        } else if (value >= 10 && value < 15) {
            return '#ff9933'

        } else if (value >= 15 && value < 20) {
            return '#cc0033'

        } else if (value >= 20 && value < 30) {
            return '#660099'

        } else if (value > 30) {
            return '#7e0023'

        }
    }

    const getLevel = () => {

        if (feedResponse?.aqi <= 50) {
            return <Typography variant='h3' color={'#009966'}>Good</Typography>

        } else if (feedResponse?.aqi >= 51 && feedResponse?.aqi <= 100) {
            return <Typography variant='h3' color={'#ffde33'}>Moderate</Typography>
        } else if (feedResponse?.aqi >= 101 && feedResponse?.aqi <= 150) {
            return <Typography variant='h3' color={'#ff9933'}>Unhealthy for Sensitive Groups</Typography>

        } else if (feedResponse?.aqi >= 151 && feedResponse?.aqi <= 200) {
            return <Typography variant='h3' color={'#cc0033'}>Unhealthy</Typography>

        } else if (feedResponse?.aqi >= 201 && feedResponse?.aqi <= 300) {
            return <Typography variant='h3' color={'#660099'}>Very Unhealthy</Typography>

        } else if (feedResponse?.aqi >= 300) {
            return <Typography variant='h3' color={'#7e0023'}>Hazardous</Typography>

        }
    }

    const getLabel = (value) => {
        if (value === 'pm25') {
            return 'PM2.5'
        } else if (value === 'pm10') {
            return 'PM10'
        } else if (value === 'so2') {
            return 'SO2'
        }
        else if (value === 'no2') {
            return 'NO2'
        }
        else if (value === 'o3') {
            return 'O3'
        }
        else if (value === 'co') {
            return 'CO'
        }
    }




    const renderBarChart = (type) => {
        if (!historicalData) return null;

        const labels = historicalData.map(entry => entry.timestamp_local);
        const pm25Values = historicalData.map(entry => entry[type]);


        const data = {
            labels,
            datasets: [
                {
                    label: getLabel(type),
                    data: pm25Values,
                    backgroundColor: pm25Values.map(item => getChartColor(item, type)),
                    borderColor: pm25Values.map(item => getChartColor(item, type)),
                    borderWidth: 1,
                    barThickness: 10
                },
            ],
        };

        const options = {
            scales: {
                x: {
                    display: false, // Hide x-axis labels
                },
                y: {
                    title: { display: true, text: `${getLabel(type)} Values` },
                },
            },
        };

        return <Bar data={data} options={options} style={{ maxHeight: 100 }} />;
    };

    if(!feedResponse?.aqi){
        return  <Alert severity="error">{apiResponse?.data}. No data found.</Alert>
    }


    return (
        <Card sx={{height: 800}}>
            <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                    {feedResponse?.city?.name}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Card sx={{ bgcolor: getBgColor(), p: 3, pl: 8, pr: 8 }}>
                            <Typography variant='h2' sx={{textAlign:'center'}}>{feedResponse?.aqi}</Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        {getLevel()}
                        <Typography variant='subtitle2'>Temparature: {feedResponse?.iaqi?.t?.v}°C</Typography>
                    </Grid>
                </Grid>

                {renderBarChart('pm25')}
                {renderBarChart('pm10')}
                {renderBarChart('o3')}
                {renderBarChart('so2')}
                {renderBarChart('no2')}
                {renderBarChart('co')}
             
            </CardContent>
        </Card>
    )
}
