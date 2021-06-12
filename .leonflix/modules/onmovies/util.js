function extractTitle(data) {
  if (data.includes(' - Season ')) {
    const reg = /(.+)( - Season )/;
    const match = reg.exec(data);
    return match ? match[1]: null;
  }
  return data.replace(/\\/g, '');
}

function cleanTitle(data) {
  return data.toLowerCase().trim().replace(/'/g, '').replace(/\\/g, '');
}

function extractSeason(data) {
  const reg = / - Season (\d+)/g;
  const match = reg.exec(data);
  return match ? parseInt(match[1]) : null;
}

function formatQuery(text) {
  return text.toLowerCase().replace(/ /g, '+');
}

function extractMid(url) {
  const reg = /id=(.+)&/;
  const match = reg.exec(url);
  return match ? match[1] : null;
}

function extractEpCount(data) {
  if (!data) return null;
  return parseInt(data.replace('E', ''));
}

function removeDupes(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}

module.exports = {
  extractTitle,
  cleanTitle,
  extractSeason,
  extractMid,
  removeDupes,
  formatQuery,
  extractEpCount
};
