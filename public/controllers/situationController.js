
const OpenAI = require('openai');
const Situation = require('../models/situation');


async function generate_next_situation(situation, option) {
  // API-Schlüssel von OpenAI
  const apiKey = process.env.OpenApiKEY;
  if (!apiKey) {
    throw new Error('API-Schlüssel fehlt.');
  }
  // Erstellen Sie eine Instanz des OpenAI API-Client
  const openai = new OpenAI({ apiKey });
  intro_prompt_string = `Dies ist ein automatisierter Prompt aus einem Textadventure. Bitte gib nur das json Object "new_situation" mit der neuen Summary und den Options als Antwort zurück!`;
  // Verwendung von Template-Literalen für den Prompt
  const prompt = `{"${intro_prompt_string}"
    "last_situation": {
      "place": "${situation.place}",
      "character": "${situation.character}",
      "summary": "${situation.summary}",
      "options": ${JSON.stringify(situation.options)},
      "selected_option": "${option}"
    },
    "task": "Generiere eine neue Situation für das Textadventure. Der Ort ('place') und der Charakter ('character') sollen gleich bleiben. Die neue Situation sollte eine Fortsetzung der letzten sein und auf der gewählten Option basieren. Formuliere eine neue Zusammenfassung ('summary') und sechs neue Handlungsoptionen ('options').",
    "new_situation": {
      "place": "${situation.place}",
      "character": "${situation.character}",
      "summary": "[Reagiere auf die 'last_situation.seletected_option' so, wie es ein Textabenteuerspiel tun würde. Die 'summary' muss zwischen 3 und 10 Sätzen liegen.]",
      "options": [
        "[Neue Option 1]",
        "[Neue Option 2]",
        "[Neue Option 3]",
        "[Neue Option 4]",
        "[Neue Option 5]",
        "[Neue Option 6]"
      ],
      "language": "de"
    }
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0613', // Stellen Sie sicher, dass Sie das korrekte Modell verwenden
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    const parsedResponse = parseAndVerifyApiResponse(response.choices[0].message.content, situation);
    if (!parsedResponse) {
      console.error('Keine gültige Antwort erhalten');
      return null; // Oder behandeln Sie den Fehler wie gewünscht
    }
    const newSummary = parsedResponse.new_situation.summary.trim();
    const newOptions = parsedResponse.new_situation.options;
    const newSituation = new Situation(situation.place, situation.character, newSummary, newOptions, situation.language);

    //console.log('New Situation:', newSituation);
    return newSituation
  } catch (error) {
    console.log('Prompt:', prompt);
    console.error('Fehler bei der API-Anfrage:', error);
    throw error;
  }
}

function parseAndVerifyApiResponse(responseText, oldSituation) {
  try {
    const parsedText = JSON.parse(responseText);

    // Utility function for logging and error handling
    function logErrorAndReturnNull(errorMessage) {
      console.log('API-Antwort:', responseText);
      console.error(errorMessage);
      return null;
    }

    // Check if parsedText and necessary properties are valid
    if (!parsedText || !parsedText.new_situation) {
      return logErrorAndReturnNull('Keine gültige neue Situation in Antwort erhalten');
    }

    const { summary, options } = parsedText.new_situation;

    if (!summary) {
      return logErrorAndReturnNull('Keine gültige neue Zusammenfassung in Antwort erhalten');
    }

    if (!Array.isArray(options) || options.length !== 6) {
      return logErrorAndReturnNull('Keine gültigen neuen Optionen in Antwort erhalten');
    }

    // Check if the first option of the new situation is identical to the old situation
    if (options.includes(oldSituation.options[0])) {
      console.log("oldSituation:", oldSituation);
      return logErrorAndReturnNull('Die erste Option ist identisch mit der ersten Option der vorherigen Situation');
    }

    return parsedText;

  } catch (error) {
    console.log('API-Antwort:', responseText);
    console.error('Fehler beim Parsen der API-Antwort:', error);

    return null;
  }
}





exports.generate_next_situation = generate_next_situation;

