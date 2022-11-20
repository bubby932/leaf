import process from 'node:process';

const CONTROL = {
    CLEAR_SCREEN: "\x1b[2J",
    RESET_CURSOR: "\x1b[;H",
    LINEFEED: "\n"
};

export class View {

    Width;
    Height;

    #buffer;

    constructor(width, height) {
        this.Width = width;
        this.Height = height;

        this.#buffer = Array(this.Width).fill(0).map(x => Array(this.Height).fill(' '));
    }

    SetChar(x, y, c) {
        this.#buffer[x][y] = c;
    }

    Purge() {
        process.stdout.write(CONTROL.CLEAR_SCREEN);
        process.stdout.write(CONTROL.RESET_CURSOR);
    }

    Flush() {
        process.stdout.write(CONTROL.CLEAR_SCREEN);
        process.stdout.write(CONTROL.RESET_CURSOR);

        for (let y = 0; y < this.Height; y++) {
            for (let x = 0; x < this.Width; x++) {
                process.stdout.write(this.#buffer[x][y]);
            }
            process.stdout.write(CONTROL.LINEFEED);
        }
    }
}