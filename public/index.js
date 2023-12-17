import {initCurrentSituation } from './controllers/languageController.js';
import { getRandomLoadingText } from './controllers/loadingTextController.js';
import { displayOptions } from './controllers/optionsController.js';


let language = 'de';
let situationHistory = [];
export let currentSituation = undefined;

export function initializeGame() {
    currentSituation = initCurrentSituation(language, currentSituation)
    updateSituation(currentSituation);
    updateBackButtonVisibility();
}

export function updateSituation(situation) {
    situationHistory.push(situation);
    displaySituation(situation);
    updateBackButtonVisibility(); 
}

async function displaySituation(situation) {
    // Display text content
    document.getElementById('situation_summary').textContent = situation.situation_summary;
    document.getElementById('story_summary').textContent = situation.story_summary;
    
    // Set image text and click event
    const imageTextElement = document.getElementById('image_text');
    imageTextElement.textContent = situation.situation_image
    imageTextElement.onclick = () => generateAndDisplayImage(situation.situation_image);

    const polaroidDiv = document.getElementById('polaroid');
    polaroidDiv.style.display = 'block'; // Show the polaroid
    // Display options
    displayOptions(situation.options);
}

async function generateAndDisplayImage(imageText) {
    if (imageText) {
        let imageurl = await generateImage(imageText);
        console.log("imageurl", imageurl);

        const situationImage = document.getElementById('situation_image');
        const imageTextElement = document.getElementById('image_text');
        const polaroidDiv = document.getElementById('polaroid');

        situationImage.src = imageurl;
        situationImage.alt = imageText; // Setzen des alternativen Textes
        situationImage.style.display = 'block'; // Bild anzeigen

        imageTextElement.style.display = 'none'; // Text ausblenden

        polaroidDiv.style.display = 'block'; // Polaroid anzeigen
    }
}



export function createButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', clickHandler);
    return button;
}

export function addNewOption() {
    const optionsDiv = document.getElementById('options');
    const addOptionButton = document.getElementById('add-option-button');

    // Verstecken des "+" Buttons
    addOptionButton.classList.add('hidden');

    // Erstellen eines Flex-Containers für das Eingabefeld und den Button
    const inputGroupDiv = document.createElement('div');
    inputGroupDiv.classList.add('option-input-group');
    optionsDiv.appendChild(inputGroupDiv);

    // Erstellen des Textfelds für neue Optionen
    const newOptionInput = document.createElement('input');
    newOptionInput.type = 'text';
    newOptionInput.placeholder = 'Neue Option eingeben';
    inputGroupDiv.appendChild(newOptionInput);

    // Erstellen des Bestätigungsbuttons mit Checkmark-Symbol
    const confirmButton = document.createElement('button');
    confirmButton.classList.add('confirm-button');
    confirmButton.innerHTML = '&#10004;'; // Unicode für Checkmark
    confirmButton.addEventListener('click', () => confirmNewOption(newOptionInput.value));
    inputGroupDiv.appendChild(confirmButton);
}



function confirmNewOption(newOption) {
    if (newOption.trim() !== '') {
        currentSituation.options.push(newOption)
        displayOptions(currentSituation.options);
    }
}


export async function selectOption(option) {
    // Starten der Animation und Anzeigen des Ladetextes
    document.getElementById('options').classList.add('fade-out');
    document.getElementById('situation_summary').textContent = getRandomLoadingText();
    document.getElementById('situation_summary').style.display = 'block';
    const imageTextElement = document.getElementById('image_text');
    imageTextElement.textContent = undefined;
    document.getElementById('story_summary').textContent = undefined;
    const situationImage = document.getElementById('situation_image');
    situationImage.style.display = 'none';
    const polaroidDiv = document.getElementById('polaroid');
    polaroidDiv.style.display = 'none';

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
     const response = await fetch('/generate_next_situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, option, language })
    });
    const data = await response.json();
    return data.situation;
}


async function generateImage(situationImageDescription) {
    if (!situationImageDescription) {
      return;
    }
    console.log('Generating image for:', situationImageDescription)
    
    try {
      const payload = {
        situation_image: situationImageDescription
      };
  
      const response = await fetch('/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

function updateBackButtonVisibility() {
    const backButton = document.getElementById('back-button');
    backButton.style.display = situationHistory.length > 1 ? 'block' : 'none';
}

function goBack() {
    if (situationHistory.length > 1) {
        situationHistory.pop();
        updateSituation(situationHistory.pop()); 
    }
    updateBackButtonVisibility();
}

document.getElementById('back-button').addEventListener('click', goBack);

document.getElementById('language-select').addEventListener('change', async function() {
    const languageSelect = document.getElementById('language-select');
    const language = languageSelect.value;
    currentSituation = initCurrentSituation(language);
    updateSituation(currentSituation);
});

window.onload = function() {
    const polaroidDiv = document.getElementById('polaroid');
    polaroidDiv.style.display = 'none';
};

initializeGame();
