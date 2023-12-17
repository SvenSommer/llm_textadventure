
 function initCurrentSituation(language, currentSituation) {
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
            situation_summary: 'Hey Abenteurer! Wähle den Ort, an dem sich dein Leben für immer ändern wird.',
            character: undefined,
            place: undefined,
            init_complete: false,
            options: [
                "Ein futuristisches Raumschiff",
                "Eine mittelalterliche Stadt",
                "Eine verlassene Unterwasserstadt",
                "Eine verlassene Insel",
                "Das Hogwards Schloss",
                "Das legendäre Ninjago City",
                "Die Zentrale von PAW Patrol",
                "Gotham City - die Stadt von Batman",
                "Die Stadt von Spiderman",
                "Die Stadt von Superman",
            ],
            language: language
        };
    }

    return currentSituation;
}


export { initCurrentSituation  };


