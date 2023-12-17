class Situation {
  constructor(init_complete, place, character, summary, story_summary, options, language) {
    this.init_complete = init_complete;
    this.place = place; 
    this.character = character;
    this.summary = summary;
    this.story_summary = story_summary;
    this.options = options;
    this.language = language;
  }
}

module.exports = Situation;