// Babylon.js render
var engine;
var scene;

function drawMap(path, path_colormap) {

    var createScene = function () {
        scene.clearColor = new BABYLON.Color3(1, 1, 1);

        var directional = new BABYLON.DirectionalLight("directional", new BABYLON.Vector3(0, -20, 45), scene);
        directional.diffuse = new BABYLON.Color3(1, 1, 1);
        directional.specular = new BABYLON.Color3(0, 0, 0);
        directional.intensity = 1;


        // Camera
        var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 1500, BABYLON.Vector3.Zero(), scene);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.9;
        camera.lowerRadiusLimit = 100;
        camera.upperRadiusLimit = 1500;
        camera.attachControl(document.getElementById("babylon"), true);

        // Ground
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture(path_colormap, scene);
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", path, 1000, 1000, 500, 0, 100, scene, false);
        ground.material = groundMaterial;

        return scene;
    };

    createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });
}


// Chart.js render

var chart;

function drawChart(altitude_profile) {
    if (chart)
        chart.destroy();

    var ctx = document.getElementById('chart').getContext('2d');

    chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: altitude_profile.map((el, index) => {
                    return index
                }),
                datasets: [{
                    label: 'Altitude profile',
                    backgroundColor: 'rgba(64, 159, 210, 0.8)',
                    borderColor: 'rgba(64, 159, 210, 0.8)',
                    data: altitude_profile
                }]
            },
            options: {
                responsive: true,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
                animation: {
                    animateScale: true
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            }
        }
    );
}

// Labeling utils functions

function getOffset(ev) {
    if (ev.layerX || ev.layerX === 0) { // Firefox
        ev._x = ev.layerX;
        ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX === 0) { // Chrome & Opera
        ev._x = ev.offsetX;
        ev._y = ev.offsetY;
    }

    return {'x': ev._x, 'y': ev._y};
}

function reset(canvas) {
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function resize(canvas, img) {
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
}

function drawLine(canvas, p1, p2, color) {
    let context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
}

$(function () {
    engine = new BABYLON.Engine(document.getElementById("babylon"), true);
    scene = new BABYLON.Scene(engine);

    $("img").mousedown(function () {
        return false;
    });

    $.ajax({
        url: "/get-heightmap-paths",
        success: function (response) {
            var paths = JSON.parse(response);
            paths.map(function (path, index) {
                $('select').append('<option value="' + path + '">' + 'File : ' + index + '</option>');
            });

            $('img').attr('src', "/get-heightmap/" + paths[0]);
            drawMap("/get-heightmap/" + paths[0], "/get-colormap/" + paths[0]);
        }
    });

    var p1;
    var p2;

    $('select').on('change', function () {
        var filename = $(this).val();
        $('img').attr('src', "/get-heightmap/" + filename);
        drawMap("/get-heightmap/" + filename, "/get-colormap/" + filename);
    });

    var img;
    $('canvas#draw').on('mousedown', function (event) {
        p1 = getOffset(event);
    });
    $('canvas#draw').on('mousemove', function (event) {
        if (p1) {
            var canvas = document.getElementById("draw");
            img = document.getElementById("image");
            p2 = getOffset(event);
            reset(canvas);
            resize(canvas, img);
            drawLine(canvas, p1, p2, "#6bb3db");
        }
    })
    $('canvas#draw').on('mouseup', function (event) {
        var positions = [
            {
                x: parseInt(p1.x * 1000 / img.clientWidth),
                y: parseInt(p1.y * 1000 / img.clientHeight)
            },
            {
                x: parseInt(p2.x * 1000 / img.clientWidth),
                y: parseInt(p2.y * 1000 / img.clientHeight)
            }
        ];

        // Plane animation
        var time = 0;

        var spot = new BABYLON.PointLight("spot", new BABYLON.Vector3(0, 100, 45), scene);
        spot.diffuse = new BABYLON.Color3(0.3, 0.6, 0.8);
        spot.specular = new BABYLON.Color3(0, 0, 0);
        spot.intensity = 0.5;

        var points = [
            new BABYLON.Vector3(positions[0].x - 500, 110, - positions[0].y + 500),
            new BABYLON.Vector3(positions[1].x - 500, 110, - positions[1].y + 500)
        ];
        var direction = [
            (positions[1].x - positions[0].x),
            (-positions[1].y + positions[0].y)
        ];

        scene.registerBeforeRender(function () {
            spot.position = new BABYLON.Vector3(positions[0].x - 500 + direction[0] * time, 110, -positions[0].y + 500 + direction[1] * time);
            time += 0.01;
            if (time > 1)
                time = 0
        });

        BABYLON.MeshBuilder.CreateLines("lines", {points: points}, scene);

        var payload = {
            positions: positions,
            filename: $('select').val()
        };

        $.ajax({
            type: "POST",
            url: "/get-altitude-profile",
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (response) {
                drawChart(JSON.parse(response));
            }
        });

        p1 = null;
    });

});