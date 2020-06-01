function drawMap(path) {
    var canvas = document.getElementById("renderCanvas");
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

$(function () {

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

    $('select').on('change', function () {
        var filename = $(this).val();
        var path = "/get-dem/" + filename;
        $('img').attr('src', path);
        drawMap(path);
    });
});