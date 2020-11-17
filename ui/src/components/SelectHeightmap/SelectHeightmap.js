import React from 'react';
import {api} from 'api';
import {Simulation} from "store/Simulation";
import {FormControl, InputLabel, MenuItem, Select} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginBottom: theme.spacing(1),
        minWidth: 140,
        maxWidth: 200
    }
}));

function SelectHeightmap() {
    const {simulation, setSimulation} = React.useContext(Simulation);
    const classes = useStyles();

    const [filenames, setFilenames] = React.useState([]);
    React.useEffect(() => {
        api.get('/heightmap/filenames')
            .then(response => setFilenames(response.data))
    }, []);

    const handleChange = (event) => {
        setSimulation({
            ...simulation,
            filename: event.target.value,
            positions: [],
            altitude_profile: [],
            tensor_particles: []
        });
    };

    return (
        <FormControl className={classes.formControl} variant="outlined">
            <InputLabel>Heightmap</InputLabel>
            <Select
                label='heightmap'
                value={simulation.filename}
                onChange={handleChange}
            >
                {filenames.map(filename => (
                    <MenuItem key={filename} value={filename}>{filename}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default SelectHeightmap;