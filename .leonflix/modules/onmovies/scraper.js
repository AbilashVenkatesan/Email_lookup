const Promise = require('promise');
const Xray = require('x-ray');
const request = require('request');
const util = require('./util');
const pckg = require('./package.json');

function searchOnMovies(query) {
  return new Promise((resolve, reject) => {
    const url = `https://onmovies.se/search/${util.formatQuery(query)}`;
    const x = new Xray();
    x(url, '.ml-mask', [{
      title: '.mli-info',
      url: '@href',
      midUrl: '@data-url',
      epCount: '.mli-eps i'
    }])((err, obj) => {
      if (err) {
        reject(err);
        return;
      }
      const formatted = obj.map(item => {
        return {
          title: util.extractTitle(item.title),
          is_movie: !item.title.includes(' - Season '),
          url: item.url,
          mid: util.extractMid(item.midUrl),
          season: util.extractSeason(item.title),
          epCount: util.extractEpCount(item.epCount)
        };
      });
      resolve(formatted);
    });
  });
}

function scrape(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, res, body) => {
      try {
        const data = JSON.parse(body);
        if (data.status) {
          resolve([data.src.split('?')[0]])
        }
      }
      catch(e) {
        reject(e);
      }
    });
  });
}

function getMetadata(mid) {
  return new Promise((resolve, reject) => {
    const x = new Xray();
    x(`https://onmovies.se/ajax/minfo.php?id=${mid}`, ['.jt-info'])((err, obj) => {

      const formatted = {
        year: obj[1],
        duration: obj[2].split(' ')[0]
      };
      resolve(formatted);
    });
  });
}

function getEpisodes(mid, epCount) {
  return new Promise((resolve, reject) => {
    request(`https://onmovies.se/ajax/mep.php?id=${mid}`, (err, res, body) => {
      const data = JSON.parse(body);
      //console.log(data);
      const x = new Xray();
      x(data.html, 'a', [{
        title: ''
      }])((err, obj) => {
        const formatted = obj.slice(0, epCount).map((ep, indx) => {
          return {
            title: ep.title,
            url: {
              module: pckg.name,
              payload: `https://onmovies.se/ajax/movie_embed.php?mid=${mid}&epNr=${indx + 1}&type=tv&server=openLoad&epIndex=0&so=5`
            }
          }
        });
        resolve(formatted);
      });
    })
  });
}

async function getEpisodeData(mid, season, epCount) {
  const metadata = await getMetadata(mid);
  const episodes = await getEpisodes(mid, epCount);
  return { season, episodes, metadata };
}

async function getMovieData(mid) {
  const metadata = await getMetadata(mid);
  return Object.assign({}, metadata, {
    url: `https://onmovies.se/ajax/movie_embed.php?mid=${mid}&epNr=1&type=film&server=openLoad&epIndex=0&so=5`
  });
}

async function mapItem(item) {
  const results = await searchOnMovies(item.title);
  const filtered = results.filter(r => r.is_movie === item.is_movie && util.cleanTitle(r.title) === util.cleanTitle(item.title));
  if (item.is_movie) {
    if (filtered.length === 0) return null;
    if (filtered.length === 1) {
      const movieData = await getMovieData(filtered[0].mid);
      return Object.assign({}, item, {
        url: {
          module: pckg.name,
          payload: movieData.url
        }
      });
    }
    if (filtered.length > 1) {
      const data = await Promise.all(filtered.map(i => getMovieData(filtered[0].mid)));
      const matches = data.filter((i, indx) => {
        return i.year === item.release_date.split('-')[0];
      });
      const result = matches[0];
      return Object.assign({}, item, {
        url: {
          module: pckg.name,
          payload: result.url
        }
      });
    }
  }
  if (!item.is_movie) {
    const data = await Promise.all(filtered.map(i => getEpisodeData(i.mid, i.season, i.epCount)));
    const possibleSeasons = data.filter((i, indx) => {
      return i.metadata.year >= item.release_date.split('-')[0];
    }).sort((a, b) => a.season - b.season);
    const formattedSeasons = possibleSeasons.map(i => i.episodes);
    return {
      url: null,
      seasons: formattedSeasons
    };
  }
  return results;
}

module.exports = {
  mapItem,
  scrape
};
