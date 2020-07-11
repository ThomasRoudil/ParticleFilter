import React from 'react';
import {api} from 'api';
import {Context} from "store/Simulation";
import {FormControl, InputLabel, MenuItem, Select} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
        marginBottom: theme.spacing(1),
        minWidth: 120,
        maxWidth: 200
    }
}));

function SelectHeightmap() {
    const {simulation, setSimulation} = React.useContext(Context);
    const classes = useStyles();

    const [filenames, setFilenames] = React.useState([]);
    React.useEffect(() => {
        api.get('/filenames')
            .then(response => setFilenames(response.data))
    }, []);

    const handleChange = (event) => {
        setSimulation({
            filename: event.target.value
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