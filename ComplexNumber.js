class ComplexNumber {
    constructor(real = 0, imaginary = 0, frequency = 0) {
        this.real = real;
        this.imaginary = imaginary;
        this.frequency = frequency;
    }

    multiply(complexNum) {
        const real = this.real * complexNum.real - this.imaginary * complexNum.imaginary;
        const imaginary = this.real * complexNum.imaginary + this.imaginary * complexNum.real;
        return new ComplexNumber(real, imaginary);
    }

    add(complexNum) {
        return new ComplexNumber(this.real + complexNum.real, this.imaginary + complexNum.imaginary);
    }

    amplitude() {
        return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
    }

    phase() {
        return Math.atan2(this.imaginary, this.real);
    }
}
