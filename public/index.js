
//require('dotenv').config();


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
            situation_summary: 'Where do you want your adventure to take place?',
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
            situation_summary: 'Où voulez-vous que votre aventure se déroule?',
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
            situation_summary: '¿Dónde quieres que se desarrolle tu aventura?',
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
            situation_summary: 'Wähle den Ort für das Textadventure.',
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

async function displaySituation(situation) {
    // Display text content
    document.getElementById('situation_summary').textContent = situation.situation_summary;
    document.getElementById('story_summary').textContent = situation.story_summary;
    
    // Set image text and click event
    const imageTextElement = document.getElementById('image_text');
    imageTextElement.textContent = situation.situation_image
    imageTextElement.onclick = () => generateAndDisplayImage(situation.situation_image);

    // Display options
    displayOptions(situation.options);
}

async function generateAndDisplayImage(imageText) {
    if (imageText) {
        let imageurl = await generateImage(imageText);
        console.log("imageurl", imageurl);
        const situationImage = document.getElementById('situation_image');
        situationImage.src = imageurl;
        situationImage.style.display = 'block'; // Show the image
    }
}

// The rest of your code...




// HTML elements remain the same


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

    const addOptionButton = createButton('+', addNewOption);
    addOptionButton.id = 'add-option-button';
    optionsDiv.appendChild(addOptionButton);
}

function createButton(text, clickHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', clickHandler);
    return button;
}

function addNewOption() {
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


async function generateImage(situationImageDescription) {
    if (!situationImageDescription) {
      return;
    }
    console.log('Generating image for:', situationImageDescription)
    
    try {
      // Create the request payload
      const payload = {
        situation_image: situationImageDescription
      };
  
      // Make the POST request to the backend
      const response = await fetch('/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Extract the JSON response
      const data = await response.json();
      return_imageurl = data.imageUrl;
      console.log('Generated image URL:', return_imageurl);
      // Return the image   URL
      return return_imageurl
    } catch (error) {
      console.error('Error generating image:', error);
      // Handle or rethrow the error as needed
      throw error;
    }
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
