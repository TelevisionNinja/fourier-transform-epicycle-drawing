let time = 0;
let waveY = [];
let waveX = [];
let wave = [];
let yPath = [];
let xPath = [];
let transformY = [];
let transformX = [];
let isDrawing = false;
let signal = [];

function discreteFourierTransform(wave) {
    const N = wave.length;
    let frequencies = [];

    const constant = 2 * Math.PI / N;

    for (let k = 0; k < N; k++) {
        const currentConstantK = constant * k;
        let sum = new ComplexNumber();

        for (let n = 0; n < N; n++) {
            const currentConstantn = currentConstantK * n;
            const value = new ComplexNumber(Math.cos(currentConstantn), -Math.sin(currentConstantn));
            sum = sum.add(wave[n].multiply(value));
        }

        sum.real /= N;
        sum.imaginary /= N;
        sum.frequency = k;

        frequencies.push(sum);
    }

    return frequencies;
}

function initialize() {
    time = 0;
    waveY = [];
    waveX = [];
    wave = [];
    yPath = [];
    xPath = [];

    for (let i = 0; i < signal.length; i++) {
        waveY.push(new ComplexNumber(0, signal[i].y));
    }
    for (let i = 0; i < signal.length; i++) {
        waveX.push(new ComplexNumber(signal[i].x, 0));
    }

    transformY = discreteFourierTransform(waveY);
    transformX = discreteFourierTransform(waveX);

    transformY.sort((a, b) => b.amplitude() - a.amplitude());
    transformX.sort((a, b) => b.amplitude() - a.amplitude());
}

function setup() {
    createCanvas(windowWidth - 16, windowHeight - 16);
}

function drawEpicycles(x, y, complexNums, theta, rotation) {
    let currentX = x;
    let currentY = y;
    let previousX = currentX;
    let previousY = currentY;

    for (let i = 0; i < complexNums.length; i++) {
        const complexNum = complexNums[i];
        const currentRadius = complexNum.amplitude();
        const frequency = complexNum.frequency;
        const phase = complexNum.phase();

        stroke(255);
        noFill();
        ellipse(currentX, currentY, currentRadius * 2);

        previousX = currentX;
        previousY = currentY;

        // center of the next circle
        currentX += currentRadius * Math.cos(frequency * theta + phase + rotation);
        currentY += currentRadius * Math.sin(frequency * theta + phase + rotation);

        line(previousX, previousY, currentX, currentY);
    }

    return {
        currentX: currentX,
        currentY: currentY
    };
}

function mousePressed() {
    isDrawing = true;
    signal = [];
}

function mouseReleased() {
    isDrawing = false;
    initialize();
}

function equal(x, y, tolerance = Number.EPSILON) {
    return Math.abs(x - y) < tolerance;
}

function draw() {
    background(0);

    if (isDrawing) {
        signal.push({
            x: mouseX - width / 2,
            y: mouseY - height / 2
        });

        beginShape();
        noFill();
        stroke(255);
        for (let i = 0; i < signal.length; i++) {
            vertex(signal[i].x + width / 2, signal[i].y + height / 2);
        }
        endShape();
    }
    else {
        // Y epicycles
        let yX = 200;
        let yY = height / 2;
        const {
            currentX: YPath,
            currentY: YEnd
        } = drawEpicycles(yX, yY, transformY, time, 0);

        // X epicycles
        let xX = width / 2;
        let xY = 200;
        const {
            currentX: XEnd,
            currentY: XPath
        } = drawEpicycles(xX, xY, transformX, time, 0);

        //----------------------------------

        if (transformX.length > 0) {
            stroke(128, 128, 255);
            line(XEnd, YEnd, XEnd, XPath); // x
        }
        if (transformY.length > 0) {
            stroke(128, 128, 255);
            line(XEnd, YEnd, YPath, YEnd); // y
        }

        //----------------------------------

        const dt = Math.PI * 2 / transformX.length;

        // only draw 1 cycle
        if (time <= Math.PI * 2) {
            // account for floating point precision
            const epsilon = Math.pow(10, -8);

            if (equal(dt * transformX.length, time, epsilon)) {
                // dont add in the starting point at the end of the cycle to prevent closing the loop
                if (!equal(XEnd, wave[0][0], epsilon) && !equal(YEnd, wave[0][1], epsilon)) {
                    yPath.push([YPath, YEnd]);
                    xPath.push([XEnd, XPath]);
                    wave.push([XEnd, YEnd]);
                }
            }
            else {
                yPath.push([YPath, YEnd]);
                xPath.push([XEnd, XPath]);
                wave.push([XEnd, YEnd]);
            }
        }

        //----------------------------------
        // draw path of series Y
        beginShape();
        noFill();
        stroke(255, 0, 0);
        for (let i = 0; i < yPath.length; i++) {
            vertex(yPath[i][0], yPath[i][1]);
        }
        endShape();

        // draw path of series X
        beginShape();
        noFill();
        stroke(255, 0, 0);
        for (let i = 0; i < xPath.length; i++) {
            vertex(xPath[i][0], xPath[i][1]);
        }
        endShape();

        //----------------------------------

        // draw image from intersections
        beginShape();
        noFill();
        stroke(255);
        for (let i = 0; i < wave.length; i++) {
            const point = wave[i];
            vertex(point[0], point[1]);
        }
        endShape();

        //----------------------------------

        time += dt;

        // clear the canvas every 2nd cycle
        if (time > Math.PI * 2 * 2) {
            yPath = [];
            xPath = [];
            wave = [];
            time = 0;
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth - 16, windowHeight - 16);
    initialize();
}
