// Babylon.js render

function drawMap(path) {
    var canvas = document.getElementById("babylon");
    var engine = new BABYLON.Engine(canvas, true);
    var sunPos = 0;
    var radius = 200;

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);

        // Light
        var spot = new BABYLON.PointLight("spot", new BABYLON.Vector3(0, 100, 45), scene);
        spot.diffuse = new BABYLON.Color3(1, 1, 1);
        spot.specular = new BABYLON.Color3(0, 0, 0);
        spot.intensity = 0.7;

        // Camera
        var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, .8, 100, BABYLON.Vector3.Zero(), scene);
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = (Math.PI / 2) * 0.9;
        camera.lowerRadiusLimit = 1000;
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
        scene.registerBeforeRender(function () {
            sun.position = spot.position;
            spot.position.x = radius * Math.cos(sunPos);
            spot.position.z = radius * Math.sin(sunPos);
            sunPos += 0.01;
        });

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

function drawChart() {
    var ctx = document.getElementById('chart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'Altitude profile',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 100, 5, 2, 20, 30, 45]
            }]
        },
        options: {}
    });
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
    context.setLineDash([2]);
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
            drawChart()
        }
    });

    $('select').on('change', function () {
        var filename = $(this).val();
        var path = "/get-dem/" + filename;
        $('img').attr('src', path);
        drawMap(path);
    });

    var p1;
    $('canvas#draw').on('mousedown', function (event) {
        p1 = getOffset(event);
    });
    $('canvas#draw').on('mousemove', function (event) {
        if (p1) {
            var canvas = document.getElementById("draw");
            var img = document.getElementById("image");
            var p2 = getOffset(event);
            reset(canvas);
            resize(canvas, img)
            drawLine(canvas, p1, p2, "#ff0000");
            console.log(p1, p2);
            console.log(img.clientWidth)
        }
    })
    $('canvas#draw').on('mouseup', function (event) {
        p1 = null;

        $.ajax({
            url: "/get-altitude-profile",
            data: null,
            success: function (response) {
                var paths = JSON.parse(response);
                paths.map(function (path) {
                    $('select').append('<option>' + path + '</option>');
                });

                $('img').attr('src', "/get-dem/" + paths[0]);
                drawMap("/get-dem/" + paths[0]);
                drawChart()
            }
        });
    });

});