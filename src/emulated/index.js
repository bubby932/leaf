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
import process, { argv } from 'node:process';
import * as scratch from './scratch_default.js';
import fs from 'node:fs';
import { View } from './view.js';

const DECOR = {
    BLOCK: "■"
}

// This buffer method is really inefficient, but it's written this way for parity with the VGA buffer on rosehip native.
const BUFFER_WIDTH = 80;
const BUFFER_HEIGHT = 25;

var renderer = new View(BUFFER_WIDTH, BUFFER_HEIGHT);


function updateHeader(textL, textR) {
    var i = 0;
    for (; i < textL.length; i++) {
        renderer.SetChar(i, 0, textL[i]);
    }

    const padding = BUFFER_WIDTH - textR.length;

    for (; i < padding; i++) {
        renderer.SetChar(i, 0, DECOR.BLOCK);
    }

    for (; i < BUFFER_WIDTH; i++) {
        renderer.SetChar(i, 0, textR[i - padding]);
    }

    renderer.Flush();
}

renderer.Purge();

readline.emitKeypressEvents(process.stdin);

process.stdin.on('keypress', keypress);

function keypress(character, keyMeta) {
    if (keyMeta.ctrl && keyMeta.name == 'x') process.exit(0);
}

process.stdin.setRawMode(true);
process.stdin.resume();

const FLAGS = {
    ALLOW_WRITE: false,
    HEX: false
};

var FILE;
var PATH = "~Scratch~";

if (argv.length > 2 && argv[2].startsWith('-')) {
    // Handle flags
    if (argv[2].includes('h')) {
        FLAGS.HEX = true;
    }

    if (argv[2].includes('W')) {
        FLAGS.ALLOW_WRITE = true;
    }

    if (argv.length == 4) {
        PATH = argv[3];
        FILE = FLAGS.HEX ? fs.readFileSync(PATH, 'binary') : fs.readFileSync(PATH).toString();
    } else if (argv.length > 4) {
        console.log("USAGE: leaf [-hW] [path]");
        process.exit(1);
    } else {
        FILE = scratch;
    }
} else {
    if (argv.length == 3) {
        PATH = argv[2];
        FILE = FLAGS.HEX ? fs.readFileSync(PATH, 'binary') : fs.readFileSync(PATH).toString();
    } else if (argv.length > 3) {
        console.log(argv);
        console.log("USAGE: leaf [-hW] [path]");
        process.exit(1);
    } else {
        FILE = scratch;
    }
}

const location = {
    x: 0,
    y: 0
};
var lines = [
    ""
];

// Parse file
if (FLAGS.HEX) {
    const hex = FILE.toString('hex');
    for (let index = 0; index < hex.length; index++) {
        const c = hex[index];
        if (index % BUFFER_WIDTH == 0 && index != 0) {
            lines[lines.length - 1] += c;
            lines.push("");
        } else {
            lines[lines.length - 1] += c;
        }
    }
} else {
    for (let index = 0; index < FILE.length; index++) {
        const c = FILE[index];
        switch (c) {
            case '\n': {
                lines[lines.length - 1] += c;
                lines.push("");
                break;
            }
            default: {
                lines[lines.length - 1] += c;
                break;
            }
        }
    }
}

updateHeader(`  ${PATH}  `, "  Leaf Text Editor  ");

function renderView() {
    for (let index = location.y; index < lines.length && index < location.y + BUFFER_HEIGHT; index++) {
        const line = lines[index];

        for (let horiz = 0; horiz < line.length - location.x && horiz < BUFFER_WIDTH; horiz++) {
            const char = line[horiz + location.x];
            renderer.SetChar(horiz, (index - location.y) + 1, char);
        }
    }

    renderer.Flush();
}

renderView();