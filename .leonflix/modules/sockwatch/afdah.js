const cloudscraper = require('cloudscraper');
const { JSDOM } = require('jsdom');

const { AES } = require('crypto-js');

//tw throwaway param
async function scrape (info, tw1 = 0, tw2 = 0, callback = null) {
  // makes sure is movie
  if (!info.is_movie) {
    return [];
  }
  //too lazy to write about the rest kek

  let END_OF_INPUT = -1;
  let arrChrs = new Array(
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '+',
    '/'
  );
  let reversegetFChars = new Array();
  for (let i = 0; i < arrChrs.length; i++) {
    reversegetFChars[arrChrs[i]] = i;
  }
  let getFStr;
  let getFCount;

  function ntos(e) {
    e = e.toString(16);
    if (e.length == 1) e = '0' + e;
    e = '%' + e;
    return unescape(e);
  }

  function readReversegetF() {
    if (!getFStr) return END_OF_INPUT;
    while (true) {
      if (getFCount >= getFStr.length) return END_OF_INPUT;
      let e = getFStr.charAt(getFCount);
      getFCount++;
      if (reversegetFChars[e]) {
        return reversegetFChars[e];
      }
      if (e == 'A') return 0;
    }
    return END_OF_INPUT;
  }

  function readgetF() {
    if (!getFStr) return END_OF_INPUT;
    if (getFCount >= getFStr.length) return END_OF_INPUT;
    let e = getFStr.charCodeAt(getFCount) & 255;
    getFCount++;
    return e;
  }

  function setgetFStr(e) {
    getFStr = e;
    getFCount = 0;
  }

  function getF(e) {
    setgetFStr(e);
    let t = '';
    let n = new Array(4);
    let r = false;
    while (
      !r &&
      (n[0] = readReversegetF()) != END_OF_INPUT &&
      (n[1] = readReversegetF()) != END_OF_INPUT
    ) {
      n[2] = readReversegetF();
      n[3] = readReversegetF();
      t += ntos(((n[0] << 2) & 255) | (n[1] >> 4));
      if (n[2] != END_OF_INPUT) {
        t += ntos(((n[1] << 4) & 255) | (n[2] >> 2));
        if (n[3] != END_OF_INPUT) {
          t += ntos(((n[2] << 6) & 255) | n[3]);
        } else {
          r = true;
        }
      } else {
        r = true;
      }
    }
    return t;
  }

  function tor(txt) {
    let map = [];
    let tmp = 'abcdefghijklmnopqrstuvwxyz';
    let buf = '';
    for (j = 0; j < tmp.length; j++) {
      let x = tmp.charAt(j);
      let y = tmp.charAt((j + 13) % 26);
      map[x] = y;
      map[x.toUpperCase()] = y.toUpperCase();
    }
    for (j = 0; j < txt.length; j++) {
      let c = txt.charAt(j);
      buf += (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ? map[c] : c;
    }
    return buf;
  }

  async function gettitlesearch(title, year) {
    let formatted = `${title}|||title`;
    let parameters2 = AES.encrypt(formatted, 'Watch Movies Online').toString();
    let esc = encodeURIComponent;
    let qss = { process: parameters2 };
    let query = Object.keys(qss)
      .map(k => esc(k) + '=' + esc(qss[k]))
      .join('&');
    const response = await cloudscraper.post({
      url: 'https://search.afdah.info/',
      headers: {
        Accept: '/',
        'Accept-Language': 'en-US,en;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Origin: 'https://afdah.info/',
        Connection: 'keep-alive',
        Referer: 'https://afdah.info/',
        DNT: '1',
        TE: 'Trailers'
      },
      body: query
    });
    const dom = new JSDOM(response);
    let links = dom.window.document.querySelectorAll('a');
    for (link of links) {
      let movieTitle = link.textContent;
      let movieYear = movieTitle.substring(movieTitle.length - 6);
      if (movieYear.includes(year)) {
        return link['href'];
      }
    }
    return null;
  }
  function getRandomArbitrary() {
    return Math.floor(Math.random() * 400) + 200;
  }

  let url = await gettitlesearch(info.title, info.release_date.split('-')[0]);
  let page = await cloudscraper.get(`https://afdah.info/${url}`);
  let dom = new JSDOM(page);
  let iframesrc1 = dom.window.document
    .querySelector('iframe')
    ['src'].split('?')[0];
  await cloudscraper.post(iframesrc1, {
    headers: {
      Accept:
        'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'private',
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: iframesrc1,
      'Upgrade-Insecure-Requests': '1',
      DNT: '1',
      TE: 'Trailers'
    },
    cloudflareTimeout: 5000,
    cloudflareMaxTimeout: 30000,
    challengesToSolve: 3,
    decodeEmails: false,
    gzip: true,
    agentOptions: { ciphers: 'ECDHE-ECDSA-AES128-SHA' },
    body: `play=continue&x=${getRandomArbitrary()}&y=${getRandomArbitrary()}`
  });
  let response = await cloudscraper.post(iframesrc1, {
    headers: {
      Accept:
        'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'private',
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: iframesrc1,
      'Upgrade-Insecure-Requests': '1',
      DNT: '1',
      TE: 'Trailers'
    },
    cloudflareTimeout: 5000,
    cloudflareMaxTimeout: 30000,
    challengesToSolve: 3,
    decodeEmails: false,
    gzip: true,
    agentOptions: { ciphers: 'ECDHE-ECDSA-AES128-SHA' },
    body: `play=continue&x=${getRandomArbitrary()}&y=${getRandomArbitrary()}`
  });
  let decodeme = response.split('salt("')[1].split('");')[0];
  let finaldata = unescape(getF(tor(getF(decodeme))));
  let decodedJson = eval(
    `([${finaldata.split('sources: [')[1].split('],')[0]}])`
  );
  let subtitleurl;
  if (finaldata.includes('.srt"')) {
    subtitleurl = `https://afdah.info/subtitles/${
      finaldata.split('.srt"')[0].split('/subtitles/')[1]
    }.srt`;
  }
  let returnme = [];
  for (link of decodedJson) {
    if (!link.file.includes('error.mp4')) {
      returnme.push({
        url: link.file,
        quality: link.label,
        extracted: true,
        subtitles: subtitleurl ? { en: subtitleurl } : undefined
      });
    }
  }
  return returnme.reverse();
};

module.exports = { scrape };
