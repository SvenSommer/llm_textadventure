class Situation {
  constructor(init_complete, place, character, story_summary, situation_summary, situation_image,  options, language) {
    this.init_complete = init_complete;
    this.place = place; 
    this.character = character;
    this.story_summary = story_summary;
    this.situation_summary = situation_summary;
    this.situation_image = situation_image;
    this.options = options;
    this.language = language;
  }
}

module.exports = Situation;