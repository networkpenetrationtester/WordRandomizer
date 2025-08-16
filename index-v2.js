const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf-8' }));
let symbols = '';
for (let key in config.binds) {
    symbols += `\\${config.binds[key]}`;
}
for (let key in config.replacers) {
    symbols += `\\${key}`;
}
symbols = `[${symbols}]`;
const matchers = [new RegExp(`(?<=\\\\)${symbols}`, 'g'), new RegExp(`${symbols}`, 'g')];

// const library = for all keys in words and replacers, make an escaped matching set of symbols. e.g. f, g, h would make a matcher of [\f\g\h], !, ?, ., would make a matcher of [\!\?\.], etc.
// the problem with this is that for example if there is a key with overlapping first few characters, such as boa and boat, "\boat" would be considered as a "\boa" and then the t would be left dangling.
const process = require('process');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: config.prompt
});

/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
MAKE SURE WHAT CHARACTERS THE FILE TERMINATES WITH. MOBY ORIGINALLY TERMINATED WITH \r\n WHICH LED TO UNEXPLAINED BEHAVIOR, ALBEIT FUNNY, IT WAS FUCKING B R O K E N
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/

const verbs = fs.readFileSync(`./Words/${config.folder}/verb.txt`, { encoding: 'utf8' }).split('\n');
const adverbs = fs.readFileSync(`./Words/${config.folder}/adverb.txt`, { encoding: 'utf8' }).split('\n');
const adjectives = fs.readFileSync(`./Words/${config.folder}/adjective.txt`, { encoding: 'utf8' }).split('\n');
const nouns = fs.readFileSync(`./Words/${config.folder}/noun.txt`, { encoding: 'utf8' }).split('\n');
const prepositions = fs.readFileSync(`./Words/preposition.txt`, { encoding: 'utf8' }).split('\n');
const names = fs.readFileSync(`./Words/name.txt`, { encoding: 'utf8' }).split('\n');

function GrammarGetter(input, nounsOverride = null) {
    switch (input) {
        case config.binds.noun:
            if (nounsOverride)
                return RandomChooser(nounsOverride);
            return RandomChooser(nouns);
        case config.binds.adjective:
            return RandomChooser(adjectives);
        case config.binds.verb:
            return RandomChooser(verbs);
        case config.binds.adverb:
            return RandomChooser(adverbs);
        case config.binds.preposition:
            return RandomChooser(prepositions);
        case config.binds.name:
            return RandomChooser(names);
        case config.binds.CARRIAGE_RETURN:
            return "\r";
        case config.binds.NEW_LINE:
            return "\n";
        // default:
        //     for (let key in config.replacers) {
        //         if (input == key) {
        //             return config.replacers[key];
        //         }
        //     }
    }
}

function RandomChooser(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function CreateSentence(blueprint) {
    //re-write with .match and .replace, i.e. forEach(match in matches) -> replace(match, GrammarGetter(match))
    //could have entire words as the replacer tags such as \noun \verb \adjective, etc. defined in config.json. Then create a global matching regex that matches ALL and performs an operation to .replace each with its corresponding random list selection
    //same problem outlined by boa boat example above. Maybe its better to just leave it the way it is.
    let out = [];
    for (let i = 0; i < blueprint.length; i++) {
        let str = blueprint.substring(i - 1, i + 1), match = [];
        if (match = str.match(matchers[0])) {
            match[0] && out.push(GrammarGetter(match[0]));
        } else if (!(i < blueprint.length && blueprint[i] == '\\' && blueprint[i + 1]?.match(matchers[1]))) {
            out.push(blueprint[i]);
        }
    }
    return out.join('');
}

function Docs() {
    //pretty print the config in a way to be read as a manual
    /*
    Future structure of config.json binds may look like
    binds: {
        key: {
            type: word/replacer,
            symbol: value
        }
    }
    */
    console.log(
        `
        --==::/ USER MANUAL \\::==--
        [=<{ WORDS }>=]
            NAME: \\${config.binds.name}
            NOUN: \\${config.binds.noun}
            ADJECTIVE: \\${config.binds.adjective}
            VERB: \\${config.binds.verb}
            ADVERB: \\${config.binds.adverb}
        [=<{ REPLACERS }>=]
            CARRIAGE RETURN: \\${config.binds.CARRIAGE_RETURN}
            NEW LINE: \\${config.binds.NEW_LINE}
        `
    );

}

rl.prompt();
rl.on('line', (input) => {
    if (input == '/?') {
        Docs();
        rl.prompt();
        return;
    }
    let sentence = CreateSentence(input);
    let length = Math.min(sentence.length, process.stdout.columns);
    let borderText = new Array(length).fill(config.separator).join('');
    console.log([borderText, sentence, borderText].join('\n'));
    rl.prompt();
    return;
});

module.exports = CreateSentence;