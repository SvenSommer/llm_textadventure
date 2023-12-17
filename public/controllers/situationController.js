
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
      "task": "Erstelle die Anfangssituation eines Textadventures. Der Spieler soll zu Beginn des Spiels aus einer Reihe von Charakteren wählen. Entwickle spannende und vielfältige Charaktere, die zum gewählten Ort (new_situation.place) passen. Führe den Spieler in die Geschichte ein und formuliere eine Zusammenfassung ('situation_summary'), die beschreibt, woher der Charakter kommt und wo er sich aktuell befindet, inklusive einer Bildbeschreibung ('situation_image'). Definiere die 'story_summary' als eine Zusammenfassung der bisherigen Geschichte aus Erzählersicht.",
      "new_situation": {
        "place": "${option}",
        "character": "Vom Spieler zu definieren",
        "story_summary": "[Entwickle den Anfang der Geschichte aus der Perspektive des Erzählers. Was ist bisher in der Welt des Spiels passiert?]",
        "situation_summary": "[Stelle die Anfangssituation vor. Frage den Spieler: 'Wer möchtest du sein?' und biete Charakteroptionen an, die zuvor entwickelt wurden.]",
        "situation_image": "[Beschreibe ein Bild für Maler, der den gewählten Ort in seiner aktuellen Anfangssituation zeigt und deute die Geschichte an, die sich entwickeln wird. Die Beschreibung sollte detailreich sein, um ein aussagekräftiges Bild zu erzeugen. Schreibe mindestens 5 Sätze.]",
        "options": [
          "[Definiere Charakteroption 1]",
          "[Definiere Charakteroption 2]",
          "[Definiere Charakteroption 3]",
          "[Definiere Charakteroption 4]",
          "[Definiere Charakteroption 5]",
          "[Definiere Charakteroption 6]"
        ],
        "language": "${language}"
      }
    }`;
  }
  else {
    // Verwendung von Template-Literalen für den Prompt
    prompt = `{
      {
        "${intro_prompt_string}",
        "last_situation": {
          "place": "${situation.place}",
          "character": "${situation.character}",
          "story_summary": "${situation.story_summary}",
          "situation_summary": "${situation.situation_summary}",
          "situation_image": "${situation.situation_image}",
          "selected_option": "${option}"
        },
        "task": "Generiere eine neue Situation für das Textadventure. Ort und Charakter bleiben gleich. Die neue Situation soll eine Fortsetzung der letzten sein, basierend auf der gewählten Option. Entwickle eine neue Situationsskizze und erweitere die Gesamtgeschichte entsprechend. Stelle sechs neue Handlungsoptionen vor. Beschreibe zudem ein Bild der Situation für einen Maler. Beachte die jewiligen Anweisungen in den "[" "]" Klammern",
        "new_situation": {
          "place": "${situation.place}",
          "character": "${situation.character}",
          "situation_summary": "[Reagiere auf die ausgewählte Option aus der 'last_situation'. Die Zusammenfassung der neuen Situation sollte 3 bis 10 Sätze umfassen.]",
          "story_summary": "[Fasse die gesamte Geschichte einschließlich der neuen Entwicklung zusammen.]",
          "situation_image": "[Beschreibe ein Bild der neuen Situation für Maler. Fange mit dem wichtigesten an und gib klare Anweisungen. Benutze einfache Sprache. In dem Bild soll die Spannung zu spüren sein, die die aktuelle Situation widerspiegelt.. Die Beschreibung sollte detailreich sein, um ein aussagekräftiges Bild zu erzeugen. Schreibe mindestens 5 Sätze.]",
          "options": [
            "[Option 1]",
            "[Option 2]",
            "[Option 3]",
            "[Option 4]",
            "[Option 5]",
            "[Option 6]"
          ],
          "language": "${language}"
        }
      }
    `;
  }
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log('Sending prompt to OpenAI API with option:', option, 'and attempt:', attempt, '..');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0613', // Stellen Sie sicher, dass Sie das korrekte Modell verwenden
        messages: [{
          role: "user",
          content: prompt
        }]
      });
      const parsedResponse = parseAndVerifyApiResponse(response.choices[0].message.content, situation);
      if (!parsedResponse) {
        console.log("Ungültige Antwort erhalten, erneuter Versuch...");
      }
      if (parsedResponse) {
        const newSituation_summary = parsedResponse.new_situation.situation_summary.trim();
        const newStorySummary = parsedResponse.new_situation.story_summary.trim();
        const newSituationImage = parsedResponse.new_situation.situation_image.trim();
        const newOptions = parsedResponse.new_situation.options;
        const newSituation = new Situation(situation.init_complete, situation.place, situation.character, newStorySummary, newSituation_summary, newSituationImage, newOptions, situation.language);

        //console.log('New Situation:', newSituation);
        return newSituation
      }
    } catch (error) {
      console.error(`Fehler bei Versuch ${attempt}:`, error);
      console.log('Prompt:', prompt);
      console.error('Fehler bei der API-Anfrage:', error);
      if (attempt === maxRetries) {
        throw new Error("Maximale Anzahl an Versuchen erreicht, Abbruch der Operation.");
      }

    }
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

    const { situation_summary, situation_image, options } = parsedText.new_situation;

    if (!situation_summary) {
      return logErrorAndReturnNull('Keine gültige neue Zusammenfassung der Situation in Antwort erhalten');
    }

    if (!situation_image) {
      return logErrorAndReturnNull('Keine gültige neue Situationsbild in Antwort erhalten');
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

