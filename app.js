//
// Util
//
function every(fn) {
    return (lines) => lines.map((line) => fn(line));
}
function all(fn) {
    return (lines) => fn(lines);
}
function noop() {
    return (lines) => lines;
}

// https://stackoverflow.com/a/30106551
function b64EncodeUnicode(str) {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        })
    );
}
// https://stackoverflow.com/a/30106551
function b64DecodeUnicode(str) {
    return decodeURIComponent(
        atob(str)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );
}

// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
    const out = array;
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

//
// Transformations
//
function add(config) {
    return every((line) => {
        const insertPos = parseInt(config['add-insert-pos']);
        if (config['add-insert'] && !Number.isNaN(insertPos)) {
            if (insertPos >= 0) {
                line = line.substring(0, insertPos) + config['add-insert'] + line.substring(insertPos);
            } else {
                line = line.substring(0, insertPos) + config['add-insert'] + line.substring(insertPos);
            }
        }
        return (config['add-prefix'] ?? '') + line + (config['add-suffix'] ?? '');
    });
}
function replace(config) {
    if (config['replace-before']) {
        return every((line) => line.replaceAll(config['replace-before'], config['replace-after']));
    }
    return noop();
}
function merge(config) {
    if (config['merge-yn'] === 'y') {
        return all((lines) => [lines.join(config['merge-separator'] ?? '')]);
    }
    return noop();
}
function caseChange(config) {
    if (config['case-change'] === 'lower') {
        return every((line) => line.toLocaleLowerCase());
    }
    if (config['case-change'] === 'upper') {
        return every((line) => line.toLocaleUpperCase());
    }
    if (config['case-change'] === 'toggle') {
        return every((line) =>
            line
                .split('')
                .map((char) =>
                    char.toLocaleLowerCase() === char ? char.toLocaleUpperCase() : char.toLocaleLowerCase()
                )
                .join('')
        );
    }
    if (config['case-change'] === 'title') {
        return every((line) =>
            line
                .split(' ')
                .map((word) => word.charAt(0).toLocaleUpperCase() + word.substr(1).toLocaleLowerCase())
                .join(' ')
        );
    }

    return noop();
}
function sort(config) {
    if (config['sort-dir'] === 'asc') {
        return all((lines) => lines.sort((a, b) => a.localeCompare(b)));
    }
    if (config['sort-dir'] === 'desc') {
        return all((lines) => lines.sort((a, b) => b.localeCompare(a)));
    }
    if (config['sort-dir'] === 'random') {
        return all((lines) => shuffleArray(lines));
    }
    return noop();
}
function filter(config) {
    if (config['filter'] === 'deduplicate') {
        return all((lines) => lines.filter((line, index) => lines.indexOf(line) === index));
    }
    if (config['filter'] === 'unique') {
        return all((lines) =>
            lines.filter((line, index) => lines.indexOf(line) === index && lines.indexOf(line, index + 1) < 0)
        );
    }
    if (config['filter'] === 'duplicates') {
        return all((lines) =>
            lines.filter((line, index) => lines.indexOf(line) === index && lines.indexOf(line, index + 1) > 0)
        );
    }
    return noop();
}
function csv(config) {
    if (config['csv-yn'] === 'y') {
        return every((line) => line.split(config['csv-separator'])[parseInt(config['csv-extract-column'])]);
    }
    return noop();
}

//
//
//

function getTransformations() {
    return [add, replace, caseChange, sort, filter, csv, merge];
}

function listener() {
    const lines = $input.value.split('\n');
    const config = Object.fromEntries(new FormData($controlsForm));
    window.location.hash = b64EncodeUnicode(JSON.stringify(config));
    const outputLines = getTransformations().reduce((acc, fn) => fn(config)(acc), lines);
    $output.value = outputLines.join('\n');
    $inputLineCount.innerText = lines.length + ' lines';
    $outputLineCount.innerText = outputLines.length + ' lines';
}

function loadConfigFromUrl() {
    try {
        const config = JSON.parse(b64DecodeUnicode(window.location.hash.substr(1)));
        for (const [key, value] of Object.entries(config)) {
            const input = $controlsForm.elements.namedItem(key);
            if (input) {
                if (input instanceof HTMLInputElement && input.type === 'checkbox') {
                    input.checked = input.value === value;
                } else {
                    input.value = value;
                }
            }
        }
    } catch (e) {
        console.log('No or invalid config in URL');
    }
    $input.value = 'lorem\nIpsum\nDOLOR\nsiD\naMeD\nlorem';
    listener();
}

const $controlsForm = document.getElementById('controls');
const $applyButton = document.getElementById('apply-button');
const $previewButton = document.getElementById('preview-button');
const $input = document.getElementById('input-textarea');
const $output = document.getElementById('output-textarea');
const $inputLineCount = document.getElementById('input-line-count');
const $outputLineCount = document.getElementById('output-line-count');
const $useOutputAsInput = document.getElementById('use-output-as-input');

$input.addEventListener('keyup', listener);
$controlsForm.addEventListener('keyup', listener);
$controlsForm.addEventListener('change', listener);
$controlsForm.addEventListener('reset', () => {
    setTimeout(() => listener());
});
$useOutputAsInput.addEventListener('click', () => {
    $input.value = $output.value;
});

loadConfigFromUrl();
