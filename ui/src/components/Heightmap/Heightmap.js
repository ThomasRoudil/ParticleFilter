import React from 'react';
import {Context} from "store/Heightmap";
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
    root: {
        position: 'relative'
    },
    img: {
        width: '100%',
        userSelect: 'none'
    },
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'crosshair',
        zIndex: 1000
    }
}));

function _reset(canvas) {
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function _resize(canvas, img) {
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
}

function _getOffset(event) {
    event = event.nativeEvent;

    if (event.layerX || event.layerX === 0) { // Firefox
        event._x = event.layerX;
        event._y = event.layerY;
    } else if (event.offsetX || event.offsetX === 0) { // Chrome & Opera
        event._x = event.offsetX;
        event._y = event.offsetY;
    }
    return {'x': event._x, 'y': event._y};
}

function _drawCursor(canvas, offset) {
    if (offset.x > 0 && offset.y > 0 && offset.x < canvas.width && offset.y < canvas.height) {
        let context = canvas.getContext('2d');
        context.setLineDash([5]);
        context.strokeStyle = '#000000';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(-1000, offset.y);
        context.lineTo(1000, offset.y);
        context.moveTo(offset.x, 0);
        context.lineTo(offset.x, 1000);
        context.stroke();
    }
}

function _drawLine(canvas, p1, p2, color) {
    let context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = color;
    context.beginPath();
    context.setLineDash([5, 3]);
    context.translate(0.5, 0.5);
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
}

function Heightmap() {
    const {heightmap} = React.useContext(Context);
    const classes = useStyles();

    const canvasRef = React.useRef();
    const imageRef = React.useRef();

    let p1, p2, _p1, _p2;

    if (!heightmap) return null;

    const handleMouseDown = event => {
        p1 = _getOffset(event);
    };

    const handleMouseMove = event => {
        let canvas = canvasRef.current;
        let img = imageRef.current;
        _reset(canvas);
        _resize(canvas, img);
        if (p1) {
            p2 = _getOffset(event);
            _drawLine(canvas, p1, p2, "#6bb3db");
        } else {
            _drawCursor(canvas, _getOffset(event))

            if (_p1 && _p2) {
                _drawLine(canvas, _p1, _p2, "#6bb3db");
            }
        }
    };

    const handleMouseUp = event => {
        if (!p1 || !p2) return;

        _p1 = p1;
        _p2 = p2;

        let img = imageRef.current;
        let positions = [
            {
                x: parseInt(p1.x * 1081 / img.clientWidth),
                y: parseInt(p1.y * 1081 / img.clientHeight)
            },
            {
                x: parseInt(p2.x * 1081 / img.clientWidth),
                y: parseInt(p2.y * 1081 / img.clientHeight)
            }
        ];
        console.log(positions)

        p1 = null;
    };

    return (
        <div className={classes.root}>
            <img
                className={classes.img}
                ref={imageRef}
                onDragStart={event => event.preventDefault()}
                src={`http://localhost:9000/get-heightmap/${heightmap}`}
                alt='Heightmap'
            />
            <canvas
                className={classes.canvas}
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    )
}

export default Heightmap;