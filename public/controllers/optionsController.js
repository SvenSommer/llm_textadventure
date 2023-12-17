import { createButton, initializeGame, selectOption, addNewOption } from '../index.js';

export function displayOptions(options) {
    const optionsDiv = document.getElementById('options');
    optionsDiv.classList.remove('fade-out');
    optionsDiv.innerHTML = '';

    if (options.length === 0) {
        optionsDiv.appendChild(createButton('Start Over', initializeGame));
        return;
    }

    // Begrenzen der anfänglich angezeigten Optionen auf fünf
    const displayedOptions = options.slice(0, 3);
    displayedOptions.forEach(option => {
        optionsDiv.appendChild(createButton(option, () => selectOption(option)));
    });

    // Button zum Anzeigen weiterer Optionen, wenn es mehr als fünf gibt
    if (options.length > 3) {
        const moreOptionsButton = createButton('Zeige weitere Möglichkeiten...', () => showMoreOptions(options));
        moreOptionsButton.id = 'more-options-button';
        optionsDiv.appendChild(moreOptionsButton);
    }

    // '+'-Button immer am Ende
    const addOptionButton = createButton('+', addNewOption);
    addOptionButton.id = 'add-option-button';
    optionsDiv.appendChild(addOptionButton);
}
function showMoreOptions(options) {
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = ''; // Löschen der bisherigen Optionen


    // Alle Optionen anzeigen
    options.forEach(option => {
        optionsDiv.appendChild(createButton(option, () => selectOption(option)));
    });

    // '+'-Button wieder hinzufügen
    const addOptionButton = createButton('+', addNewOption);
    addOptionButton.id = 'add-option-button';
    optionsDiv.appendChild(addOptionButton);
}
