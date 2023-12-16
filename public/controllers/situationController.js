
const { OpenAIAPI } = require('openai');
const Situation = require('../models/situation');

function generate_next_mock_situation(situation, option) {
  
  current_situation =  new Situation(situation.place, situation.character, generate_mock_situation_summary(option), generate_mock_options(option), situation.language);
  console.log(current_situation);
  return current_situation;
}

async function generate_next_situation(situation, option) {
  // API-Schlüssel von OpenAI
  const apiKey = process.env.OpenApiKEY;
  if (!apiKey) {
    throw new Error('API-Schlüssel fehlt.');
  }
  // Erstellen Sie eine Instanz des OpenAI API-Client
  const openai = new OpenAIAPI({ apiKey });

  // Verwendung von Template-Literalen für den Prompt
  const prompt = `${intro_prompt_string} {
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
      "summary": "[Beschreibe, wie sich die Situation nach der Vorbereitung des traditionellen Heilmittels entwickelt hat]",
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
    // Senden Sie die Anfrage an die OpenAI API
    const response = await openai.completions.create({
      model: 'text-davinci-003', // Oder ein anderes Modell Ihrer Wahl
      prompt: prompt,
      max_tokens: 150 // Anpassen basierend auf der erwarteten Antwortlänge
    });


    // Extrahieren Sie die Antwort und erstellen Sie die neue Situation
    const newSummary = response.choices[0].text.trim();
    const newSituation = new Situation(situation.place, situation.character, newSummary, generate_mock_options(option), situation.language);

    console.log(newSituation);
    return newSituation;
  } catch (error) {
    console.error('Fehler bei der API-Anfrage:', error);
    throw error;
  }
}



function generate_mock_situation_summary(option) {
  return "Der weise Heiler befindet sich in einem kleinen, abgelegenen Dorf im Wilden Westen. Das Dorf wird von einer rätselhaften Krankheit heimgesucht, die die Bewohner schwächt. Gerüchte über eine seltene Heilpflanze in einem gefährlichen, nahen Canyon machen die Runde. Der Heiler muss entscheiden, wie er dem Dorf am besten helfen kann, während er gleichzeitig mit dem Misstrauen der Dorfbewohner und den Gefahren der Wildnis konfrontiert ist.";
}

function generate_mock_options(option) {
  const options = [];
  options.push("Untersuche die Symptome der Kranken, um mehr über die Krankheit herauszufinden.",);
  options.push("Begib dich in den Canyon, um die seltene Heilpflanze zu suchen.");
  options.push("Berate dich mit den Dorfältesten, um mehr über lokale Heilmittel und Traditionen zu erfahren.");
  options.push("Bereite mit den vorhandenen Kräutern ein traditionelles Heilmittel vor.");
  options.push("Lehre die Dorfbewohner, wie sie sich besser vor der Krankheit schützen können.");
  options.push("Suche nach anderen Heilern oder Weisen in der Umgebung, die möglicherweise helfen können.");
  options.push("Verlasse das Dorf und suche nach einem anderen Ort, an dem du gebraucht wirst.");
  return options;
}

module.exports = {
  generate_next_mock_situation,
  generate_next_situation
};
