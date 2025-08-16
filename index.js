const fs = require('node:fs');
const process = require('process');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'INPUT SENTENCE SCAFFOLDING> '
});

let folder = "MOBY";

/*
!!!! 
MAKE SURE WHAT CHARACTERS THE FILE TERMINATES WITH. MOBY ORIGINALLY TERMINATED WITH \r\n WHICH LED TO UNEXPLAINED BEHAVIOR, ALBEIT FUNNY, IT WAS FUCKING B R O K E N
!!!!
*/

const verbs = fs.readFileSync(`./Words/${folder}/Verbs.txt`, { encoding: 'utf8' }).split('\r\n');
const adverbs = fs.readFileSync(`./Words/${folder}/Adverbs.txt`, { encoding: 'utf8' }).split('\r\n');
const adjectives = fs.readFileSync(`./Words/${folder}/Adjectives.txt`, { encoding: 'utf8' }).split('\r\n');
const prepositions = fs.readFileSync(`./Words/OSINT/Prepositions.txt`, { encoding: 'utf8' }).split('\r\n');
const nouns = fs.readFileSync(`./Words/${folder}/Nouns.txt`, { encoding: 'utf8' }).split('\r\n');
// const moreNouns = [];

function GrammarGetter(input, nounsOverride = null) {
    switch (input) {
        case '*':
            if (nounsOverride)
                return RandomChooser(nounsOverride);
            return RandomChooser(nouns);
        case '#':
            return RandomChooser(adjectives);
        case '^':
            return RandomChooser(verbs);
        case '?':
            return RandomChooser(adverbs);
        case '<':
            return RandomChooser(prepositions);
        case '~':
            return '\r';
    }
}

function RandomChooser(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function CreateSentence(blueprint) {
    let out = [];
    for (let i = 0; i < blueprint.length; i++) {
        let str = blueprint.substring(i - 1, i + 1), match = [];
        if (match = str.match(/(?<=\\)[\*\#\^\?\<\~]/g)) {
            match[0] && out.push(GrammarGetter(match[0]));
        } else if (!(i < blueprint.length && blueprint[i] == '\\' && blueprint[i + 1]?.match(/[\*\#\^\?\<\~]/g))) {
            out.push(blueprint[i]);
        }

    }
    out = out.join('');
    return out;
}

rl.prompt();
rl.on('line', (input) => {
    let sentence = CreateSentence(input);
    let len = Math.min(sentence.length, process.stdout.columns);
    let borderText = new Array(len).fill('=').join('');
    console.log([borderText, sentence, borderText].join('\n'));
    rl.prompt();
});

module.exports = CreateSentence;