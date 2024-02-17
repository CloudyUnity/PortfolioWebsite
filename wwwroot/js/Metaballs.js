const ctx = canvas.getContext('2d', { alpha: false }, { willReadFrequently: true });
ctx.clearRect(0, 0, canvas.width, canvas.height);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var size = 0.1;
var borderSize = 0.15;

var precision = 20;
var p05 = precision * 0.5;

var bpp = 4;

var startTime = performance.now();

const metaballs = [
    { x: 0, y: 0, radius: 30 }
];

for (var i = 0; i < metaballsClusters.length; i++) {
    for (var m = 0; m < metaballsClusters[i].count; m++) {
        var randX = Math.random() * 100 + metaballsClusters[i].x;
        var randY = Math.random() * 100 + metaballsClusters[i].y;
        var randRadi = Math.random() * 100 + 40 - m;

        metaballsClusters[i].metaballs.push({ x: randX, y: randY, radius: randRadi });
    }
}

function distance(x0, y0, x1, y1, m) {
    return m / Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 2;
}

function sumMetaballs(x, y, metaballs) {
    var sum = 0;

    for (var i = 0; i < metaballs.length; i++) {
        sum += distance(x, y, metaballs[i].x, metaballs[i].y, metaballs[i].radius);
        if (sum > borderSize)
            return sum;
    }

    for (var i = 0; i < metaballsClusters.length; i++) {
        for (var m = 0; m < metaballsClusters[i].count; m++) {
            sum += distance(x, y, metaballsClusters[i].metaballs[m].x, metaballsClusters[i].metaballs[m].y, metaballsClusters[i].metaballs[m].radius);
            if (sum > borderSize)
                return sum;
        }        
    }

    return sum;
}

function checkPixel(i, imageData) {
    if (i < 0)
        return false;

    var sum = sumMetaballs(i % canvas.width, ~~(i / canvas.width), metaballs);
    if (size > sum)
        return false;

    var color = borderSize <= sum ? 0 : 20;

    var i4 = i * bpp;
    imageData.data[i4] = color;
    imageData.data[i4 + 1] = color;
    imageData.data[i4 + 2] = color;
    if (bpp == 4)
        imageData.data[i4 + 3] = 255;

    return true;
}

function lerp(a, b, alpha) {
    return a + alpha * (b - a);
}

function drawMetaballs() {
    metaballs[0].x = mousePosition.x;
    metaballs[0].y = mousePosition.y;

    var deltaTime = performance.now() - this.startTime;

    var dist = 20;
    var speed = 0.0001;
    var clusterSpeed = 0.5;

    for (var i = 0; i < metaballsClusters.length; i++) {
        for (var m = 0; m < metaballsClusters[i].count; m++) {
            var x = Math.cos(deltaTime * speed + m ** 3 + metaballsClusters[i].x + metaballsClusters[i].y) * (m + 1) * dist;
            var y = Math.sin(deltaTime * speed + m ** 2) * (m+1) * dist;

            x += metaballsClusters[i].x;
            y += metaballsClusters[i].y;

            x -= metaballsClusters[i].metaballs[m].x;
            y -= metaballsClusters[i].metaballs[m].y;
            var mag = Math.sqrt(x * x + y * y);
            x = Math.min(x, x / mag);
            y = Math.min(y, y / mag);

            metaballsClusters[i].metaballs[m].x += x * clusterSpeed;
            metaballsClusters[i].metaballs[m].y += y * clusterSpeed;
        }
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height, { willReadFrequently: true });    

    var pixels = imageData.data.length / bpp;

    var seen = true;
    for (var i = 0; i < pixels; i += precision) {
        var hit = checkPixel(i, imageData);

        if (!seen && !hit)
            continue;

        if (seen && !hit) {
            for (var j = -p05; j < 0; j++) {
                if (!checkPixel(i + j, imageData))
                    break;
            }    

            seen = false;
            continue;
        }

        while (!seen && hit) {
            hit = checkPixel(--i, imageData);
        }

        for (var j = -p05; j < p05; j++) {
            if (j != 0)
                checkPixel(i + j, imageData);
        }    
        seen = true;
    }

    ctx.putImageData(imageData, 0, 0);

    ctx.font = "bold 18px Arial";
    ctx.textAlign = 'center';
    for (var i = 0; i < metaballsClusters.length; i++) {
        ctx.fillText(metaballsClusters[i].name, metaballsClusters[i].x, metaballsClusters[i].y);
    }

    requestAnimationFrame(drawMetaballs);
}

function checkPositionWithinBalls(x, y, metaballs) {
    for (var i = 0; i < metaballs.length; i++) {
        var dx = metaballs[i].x - x;
        var dy = metaballs[i].y - y;
        var mag = Math.sqrt(dx * dx + dy * dy);
        if (mag <= metaballs[i].radius)
            return true;
    }
    return false;
}

document.addEventListener('mousedown', function (event) {
    for (var i = 0; i < metaballsClusters.length; i++) {
        if (!checkPositionWithinBalls(mousePosition.x, mousePosition.y, metaballsClusters[i].metaballs))
            continue;

        if (metaballsClusters[i].newTab)
            window.open(metaballsClusters[i].ref, '_blank');
        else
            window.location.replace(metaballsClusters[i].ref);
        return;
    }
});

drawMetaballs();