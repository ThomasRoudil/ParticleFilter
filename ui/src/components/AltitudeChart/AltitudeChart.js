import React from 'react';
import {Simulation} from 'store/Simulation';
import {Title} from 'components';
import {Line, LineChart, ResponsiveContainer, YAxis} from 'recharts';
import {useTheme} from '@material-ui/core/styles';

function createData(time, altitude) {
    return {time, altitude};
}

export default function AltitudeChart() {
    const {simulation} = React.useContext(Simulation);
    const theme = useTheme();

    if (!simulation.altitude_profile) return null;

    return (
        <React.Fragment>
            <Title>Altitude profile</Title>
            <ResponsiveContainer
                width='100%'
                height={300}
            >
                <LineChart
                    width='100%'
                    data={simulation.altitude_profile.map((altitude, index) => createData(index, altitude))}
                >
                    <YAxis stroke={theme.palette.text.secondary} width={0}/>
                    <Line type="monotone" dataKey="altitude" stroke={theme.palette.primary.main} dot={false}/>
                </LineChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
}