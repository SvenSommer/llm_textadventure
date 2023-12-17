
require('dotenv').config();


let language = 'de';
let currentSituation = undefined;
let situationHistory = [];

function initializeGame() {
    currentSituation = initcurrentSituation(language)
    updateSituation(currentSituation);
    updateBackButtonVisibility();
}

function initcurrentSituation(language) {
    if (language === 'en') {
        currentSituation = {
            summary: 'Where do you want your adventure to take place?',
            character: undefined,
            place: undefined,
            init_complete: false,
            options: [
                'A world of fantasy and magic',
                'A science-fiction space opera',
                'The Wild West',
                'A corporate office',
                'A psychedelic dream world'
            ],
            language: language
        };
    }
    else if (language === 'fr') {
        currentSituation = {
            summary: 'Où voulez-vous que votre aventure se déroule?',
            character: undefined,
            place: undefined,
            init_complete: false,
            options: [
                'Un monde de fantaisie et de magie',
                'Une opéra spatial de science-fiction',
                'Le Far West',
                'Un bureau d\'entreprise',
                'Un monde de rêve psychédélique'
            ],
            language: language
        };
    }
    else if (language === 'es') {
        currentSituation = {
            summary: '¿Dónde quieres que se desarrolle tu aventura?',
            character: undefined,
            place: undefined,
            init_complete: false,
            options: [
                'Un mundo de fantasía y magia',
                'Una ópera espacial de ciencia ficción',
                'El Viejo Oeste',
                'Una oficina corporativa',
                'Un mundo de sueños psicodélico'
            ],
            language: language
        };
    }
    else if (language === 'de') {
        currentSituation = {
            summary: 'Wähle den Ort für das Textadventure.',
            character: undefined,
            place: undefined,
            init_complete: false,
            options: [
                "Eine verzauberte Burg",
                "Ein futuristisches Raumschiff",
                "Ein geheimnisvoller Dschungel",
                "Eine mittelalterliche Stadt",
                "Eine verlassene Unterwasserstadt",
                "Eine dystopische Metropole"
            ],
            language: language
        };
    }

    return currentSituation;
}

function updateSituation(situation) {
    situationHistory.push(situation);
    displaySituation(situation);
    updateBackButtonVisibility(); 
}

function displaySituation(situation) {
    const situationDiv = document.getElementById('situation');
    situationDiv.textContent = situation.summary;
    console.log('Current situation:', situation);

    displayOptions(situation.options);
}

function displayOptions(options) {
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    if (options.length === 0) {
        optionsDiv.appendChild(createButton('Start Over', initializeGame));
        return;
    }

    options.forEach(option => {
        optionsDiv.appendChild(createButton(option, () => selectOption(option)));
    });
}

function createButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', clickHandler);
    return button;
}


async function selectOption(option) {
    // Überprüfen, ob ein Charakter ausgewählt wurde und die Situation aktualisieren
    if (currentSituation.place === undefined) {
        currentSituation.place = option;
        currentSituation = await queryNextSituation(currentSituation, option, language);
        updateSituation(currentSituation);
    }else if (!currentSituation.init_complete) { 
        currentSituation.character = option;
        currentSituation = await queryNextSituation(currentSituation, option, language);
        currentSituation.init_complete = true;
        updateSituation(currentSituation);
    }
    
    else {
        // Ansonsten normal fortfahren
        currentSituation = await queryNextSituation(currentSituation, option, language);
        updateSituation(currentSituation);
    }
}


async function queryNextSituation(situation, option, language) {
    console.log('Querying next situation for:', situation, option, language);
    const response = await fetch('/generate_next_situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, option, language })
    });
    const data = await response.json();
    return data.situation;
}

function updateBackButtonVisibility() {
    const backButton = document.getElementById('back-button');
    backButton.style.display = situationHistory.length > 1 ? 'block' : 'none';
}

function onLanguageChange() {
    const languageSelect = document.getElementById('language-select');
    const language = languageSelect.value;
    console.log('Selected language:', language);
    initcurrentSituation(language);
    updateSituation(currentSituation);
}

function goBack() {
    if (situationHistory.length > 1) {
        situationHistory.pop();
        updateSituation(situationHistory.pop()); 
    }
    updateBackButtonVisibility();
}

document.getElementById('back-button').addEventListener('click', goBack);
document.getElementById('language-select').addEventListener('change', onLanguageChange);

initializeGame();
