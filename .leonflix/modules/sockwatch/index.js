const request = require('request');
const afdah = require('./afdah');
const rlsbb = require('./rlsbb');
const xpause = require('./xpause');


function directSearch(item, season, episode, callback) {
  season = season + 1;
  episode = episode + 1;
  if (item.is_movie) {
    afdah.scrape(item)
      .then(callback)
      .catch(console.error);
    rlsbb.scrape(item)
      .then(callback)
      .catch(console.error);
  } else {
    rlsbb.scrape(item, season, episode)
      .then(callback)
      .catch(console.error);
  }
}

function test() {
  directSearch({
    title: 'Avengers: Endgame',
    release_date: '2019',
    is_movie: true
  }, 0, 0, console.log);
}

function testTV() {
  directSearch({
    title: 'Black Mirror',
    release_date: '2011',
    is_movie: false
  }, 4, 1, console.log);
}

//testTV();

module.exports = {
  directSearch
};
