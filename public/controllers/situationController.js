
const OpenAI = require('openai');
const Situation = require('../models/situation');


async function generate_next_situation(situation, option, language) {
  // API-Schlüssel von OpenAI
  const apiKey = process.env.OpenApiKEY;
  if (!apiKey) {
    throw new Error('API-Schlüssel fehlt.');
  }
  // Erstellen Sie eine Instanz des OpenAI API-Client
  const openai = new OpenAI({ apiKey });

  let intro_prompt_string = `Automatisierter Prompt für ein Textadventure. Bitte gib das json Object "new_situation" mit einer neuen Zusammenfassung und Optionen zurück.`;


  if (situation.character === undefined) {
    prompt = `{
    "${intro_prompt_string}",
    "task": "Erstelle die Anfangssituation eines Textadventures. Der Spieler soll zu Beginn des Spiels den Charakter wählen. Formuliere mehrere spannende und abwechslungsreiche Charaktere, die für ein Textadventure geeignet sind und zu new_situation.place passen.
    Außerdem führe den Spieler in die Geschichte ein und formuliere eine Zusammenfassung ('summary') wo der Character herkommt und wo er sich aktuell befindet und definiere die 'story_summary' als eine Zusammenfassung der bisherigen Geschichte.",
    "new_situation": {
      "place": "${option}",
      "character": "Vom Spieler zu definieren",
      "summary": "[Definiere eine Zusammenfassung für die Anfangssituation. Frage dann, 'Wer möchtest du sein?' und formuliere die Optionen entsprechend der Charaktere, die du formuliert hast.]",
      "story_summary": "[Definiere eine Anfang der gesamten Geschichte. Was ist bisher passiert?]",
      "options": [
        "[Character Option 1]",
        "[Character Option 2]",
        "[Character Option 3]",
        "[Character Option 4]",
        "[Character Option 5]",
        "[Character Option 6]"
      ],
      "language": "de"
      }
    }`;
  }
  else {
    // Verwendung von Template-Literalen für den Prompt
    prompt = `{"${intro_prompt_string}"
    "last_situation": {
      "place": "${situation.place}",
      "character": "${situation.character}",
      "summary": "${situation.summary}",
      "story_summary": "${situation.story_summary}",
      "options": ${JSON.stringify(situation.options)},
      "selected_option": "${option}"
    },
    "task": "Generiere eine neue Situation für das Textadventure. Der Ort ('place') und der Charakter ('character') sollen gleich bleiben. Die neue Situation sollte eine Fortsetzung der letzten sein und auf der gewählten Option basieren. Formuliere eine neue Zusammenfassung ('summary') und sechs neue Handlungsoptionen ('options').",
    "new_situation": {
      "place": "${situation.place}",
      "character": "${situation.character}",
      "summary": "[Reagiere auf die 'last_situation.seletected_option' so, wie es ein Textabenteuerspiel tun würde. Die 'summary' muss zwischen 3 und 10 Sätzen liegen.]",
      "story_summary": "[Schreibe fort und fasse zusammen, was bisher in der gesamten Geschichte passiert ist, mit der Ergänzung der neuen Situation.]"
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
  }

  try {
    console.log('Prompt:', prompt);
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
    const newStorySummary = parsedResponse.new_situation.story_summary.trim();
    const newOptions = parsedResponse.new_situation.options;
    const newSituation = new Situation(situation.init_complete, situation.place, situation.character, newSummary, newStorySummary, newOptions, situation.language);

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

    const { summary, options } = parsedText.new_situation;

    if (!summary) {
      return logErrorAndReturnNull('Keine gültige neue Zusammenfassung in Antwort erhalten');
    }

    if (!Array.isArray(options) || options.length !== 6) {
      return logErrorAndReturnNull('Keine gültigen neuen Optionen in Antwort erhalten');
    }

    // Check if the first option of the new situation is identical to the old situation
    if (oldSituation != undefined && oldSituation.options != undefined && options.includes(oldSituation.options[0])) {
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

