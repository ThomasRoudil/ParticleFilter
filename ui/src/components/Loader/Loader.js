import React from 'react';
import PropTypes from 'prop-types';
import {Backdrop, CircularProgress} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    backdrop: {
        position: 'absolute',
        zIndex: 10000,
    },
}));

function Loader(props) {
    const {open, ...rest} = props;
    const classes = useStyles();

    return (
        <Backdrop className={classes.backdrop} open={open}>
            <CircularProgress color='secondary' {...rest}/>
        </Backdrop>
    )
}

Loader.propTypes = {
    open: PropTypes.bool.isRequired
};

export default Loader