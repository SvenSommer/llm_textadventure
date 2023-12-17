const loadingTexts = [
    "Eine mutige Wahl...",
    "Eine interessante Wahl...",
    "Eine ungewöhnliche Wahl...",
    "Eine unerwartete Wahl...",
    "Nun, das ist interessant...",
    "Hmm, das ist interessant...",
    "Es wird spannend...",
    "Das wird spannend...",
    "Das führt zu unerwarteten Konsequenzen...",
    "Das wird Konsequenzen haben...",
    "Das wird Folgen haben...",
    "Das wird interessant...",
    "Na wie du meinst...",
    "Wie du willst...",
    "Moment, damit habe ich nicht gerechnet...",
    "Das habe ich nicht erwartet...",
    "Das ist ungewöhnlich...",
    "Das ist unerwartet...",
    "Schauen wir uns das mal an...",
    "Das ist eine interessante Wahl...",
    "Ok, ganz schön mutig...",
    "Ok, das ist mutig...",
    "Das trauen sich nicht viele...",
    "Das habe ich mir fast gedacht...",
    "Du hattest die Wahl...",
    "Das wird ja immer besser...",
    // Fügen Sie hier weitere Texte hinzu
];
export function getRandomLoadingText() {
    return loadingTexts[Math.floor(Math.random() * loadingTexts.length)];
}
