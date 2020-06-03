// Babylon.js render

function drawMap(path, positions=null) {
    var canvas = document.getElementById("babylon");
    var engine = new BABYLON.Engine(canvas, true);
    var time = 0;

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);

        // Light
        var spot = new BABYLON.PointLight("spot", new BABYLON.Vector3(0, 100, 45), scene);
        spot.diffuse = new BABYLON.Color3(1, 1, 1);
        spot.specular = new BABYLON.Color3(0, 0, 0);
        spot.intensity = 0.5;

        // Camera
        var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, .8, 1000, BABYLON.Vector3.Zero(), scene);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.9;
        camera.lowerRadiusLimit = 500;
        camera.upperRadiusLimit = 1500;
        camera.attachControl(canvas, true);

        // Ground
        var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
        var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", path, 1000, 1000, 250, 0, 100, scene, false);
        ground.material = groundMaterial;

        //Sphere to see the light's position
        var sun = BABYLON.Mesh.CreateSphere("sun", 10, 4, scene);
        sun.material = new BABYLON.StandardMaterial("sun", scene);
        sun.material.emissiveColor = new BABYLON.Color3(1, 1, 0);

        //Sun animation
        if (positions) {
            var points = [
                new BABYLON.Vector3(positions[0].x - 500, 250, positions[0].y - 500),
                new BABYLON.Vector3(positions[1].x - 500, 250, positions[1].y - 500)
            ];
            var direction = [
                (positions[1].x - positions[0].x),
                (positions[1].y - positions[0].y)
            ]
            scene.registerBeforeRender(function () {
                sun.position = spot.position;
                spot.position = new BABYLON.Vector3(positions[0].x - 500 + direction[0] * time, 250, positions[0].y - 500 + direction[1] * time);
                time += 0.01;
                if (time > 1)
                    time = 0
            });
        }

        // Trajectory
        if (positions) {
            var points = [
                new BABYLON.Vector3(positions[0].x - 500, 250, positions[0].y - 500),
                new BABYLON.Vector3(positions[1].x - 500, 250, positions[1].y - 500)
            ];
            var lines = BABYLON.MeshBuilder.CreateLines("lines", {points: points}, scene);
        }

        return scene;
    };

    var scene = createScene();
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
    $("img").mousedown(function () {
        return false;
    });

    $.ajax({
        url: "/get-dem-paths",
        success: function (response) {
            var paths = JSON.parse(response);
            paths.map(function (path) {
                $('select').append('<option>' + path + '</option>');
            });

            $('img').attr('src', "/get-dem/" + paths[0]);
            drawMap("/get-dem/" + paths[0]);
        }
    });

    var p1;
    var p2;

    $('select').on('change', function () {
        var filename = $(this).val();
        var path = "/get-dem/" + filename;
        $('img').attr('src', path);
        drawMap(path);
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
        drawMap("get-dem/" + $('select').val(), positions);

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