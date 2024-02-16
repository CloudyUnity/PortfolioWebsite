var fpsCounter = {
    startTime: 0,
    frameCount: 0,
    fps: 0,
    displayElement: document.getElementById('fpsCounter'), // Change 'fpsCounter' to the ID of your HTML element

    start: function () {
        this.startTime = performance.now();
        this.frameCount = 0;
        this.update();
    },

    update: function () {
        this.frameCount++;
        var currentTime = performance.now();
        var deltaTime = currentTime - this.startTime;

        if (deltaTime >= 1000) { // Update every second
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.startTime = currentTime;
            this.frameCount = 0;

            if (this.displayElement) {
                this.displayElement.textContent = 'FPS: ' + this.fps;
            }
        }

        requestAnimationFrame(this.update.bind(this));
    }
};

// Start the FPS counter
fpsCounter.start();