let time = 0;
let wave = [];
let transform = [];
let isDrawing = false;
let signal = [];

function discreteFourierTransform(wave) {
    const N = wave.length;
    let frequencies = [];

    const constant = -2 * Math.PI / N;

    for (let k = 0; k < N; k++) {
        const currentConstantK = constant * k;
        let sum = new ComplexNumber();

        for (let n = 0; n < N; n++) {
            const currentConstantn = currentConstantK * n;
            const value = new ComplexNumber(Math.cos(currentConstantn), Math.sin(currentConstantn));
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
    wave = [];
    yPath = [];
    xPath = [];

    let complexNumbers = [];
    for (let i = 0; i < signal.length; i++) {
        complexNumbers.push(new ComplexNumber(signal[i].x, signal[i].y));
    }

    transform = discreteFourierTransform(complexNumbers);

    transform.sort((a, b) => b.amplitude() - a.amplitude());
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
        let cX = width / 2;
        let cY = height / 2;
        const {
            currentX: XEnd,
            currentY: YEnd
        } = drawEpicycles(cX, cY, transform, time, 0);

        //----------------------------------

        const dt = Math.PI * 2 / transform.length;

        // only draw 1 cycle
        if (time <= Math.PI * 2) {
            // account for floating point precision
            const epsilon = Math.pow(10, -7);

            if (equal(dt * transform.length, time, epsilon)) {
                // dont add in the starting point at the end of the cycle to prevent closing the loop
                if (!equal(XEnd, wave[0][0], epsilon) && !equal(YEnd, wave[0][1], epsilon)) {
                    wave.push([XEnd, YEnd]);
                }
            }
            else {
                wave.push([XEnd, YEnd]);
            }
        }

        //----------------------------------

        // draw image from the end of the circles
        beginShape();
        noFill();
        stroke(0, 255, 0);
        for (let i = 0; i < wave.length; i++) {
            const point = wave[i];
            vertex(point[0], point[1]);
        }
        endShape();

        //----------------------------------

        time += dt;

        // clear the canvas every 2nd cycle
        if (time > Math.PI * 2 * 2) {
            wave = [];
            time = 0;
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth - 16, windowHeight - 16);
    initialize();
}
