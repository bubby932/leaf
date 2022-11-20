// This is written in javascript since that's where I'm best with the terminal functions,
// ideally it would be in something like C or Rust for speed's sake but this is just a logic test pretty much
// since the actual app will be written in Davis anyway

// Using the same dimensions as the VGA buffer for consistency's sake.

/*
    Usage:
        leaf [-h]
        leaf [-hW] [file_path]    

    Flags:
        -h - Hex editor mode, replaces the default text mode with a hex editor.
        -W - Allows saving the file, by default leaf opens files as read-only and immediately closes them. This overrides that behaviour

    No File:
        Opens an in-memory scratch file with read & write access.
        Can be persisted to disk, which will reopen the file as with a normal file.
*/

import readline from 'node:readline'
import process from 'node:process';
import fs from 'node:fs';

const CONTROL = {
    CLEAR_SCREEN: "\x1b[2J",
    RESET_CURSOR: "\x1b[;H",
    LINEFEED: "\n"
};

const DECOR = {
    BLOCK: "■"
}

// This buffer method is really inefficient, but it's written this way for parity with the VGA buffer on rosehip native.
const BUFFER_WIDTH = 80;
const BUFFER_HEIGHT = 25;

var RenderBuffer = Array(BUFFER_WIDTH).fill(0).map(x => Array(BUFFER_HEIGHT).fill(' '));


function refresh() {
    process.stdout.write(CONTROL.CLEAR_SCREEN);
    process.stdout.write(CONTROL.RESET_CURSOR);

    for (let y = 0; y < BUFFER_HEIGHT; y++) {
        for (let x = 0; x < BUFFER_WIDTH; x++) {
            process.stdout.write(RenderBuffer[x][y]);
        }
        process.stdout.write(CONTROL.LINEFEED);
    }
}

function doRenderHeader(textL, textR) {
    var i = 0;
    for (; i < textL.length; i++) {
        RenderBuffer[i][0] = textL[i];
    }

    const padding = BUFFER_WIDTH - textR.length;

    for (; i < padding; i++) {
        RenderBuffer[i][0] = DECOR.BLOCK;
    }

    for (; i < BUFFER_WIDTH; i++) {
        RenderBuffer[i][0] = textR[i - padding];
    }
}

console.log(CONTROL.CLEAR_SCREEN);
console.log(CONTROL.RESET_CURSOR);

readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', keypress);

function keypress(character, keyMeta) {
    if (keyMeta.ctrl && keyMeta.name == 'x') process.exit(0);
}

process.stdin.setRawMode(true);
process.stdin.resume();

doRenderHeader("  hello  ", "  world  ");
refresh();