
export function calcTextColorFromBgColor(hexcolor) {
  const r = parseInt(hexcolor.substring(1,3),16);
  const g = parseInt(hexcolor.substring(3,5),16);
  const b = parseInt(hexcolor.substring(5,7),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;

  return (yiq >= 128) ? 'black' : 'white';
}

export function rndBetween(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
  return rnd(min, max);
}

export function getRandomUsername(): string {
  const adjectives = [
    'little',
    'aggressive',
    'annoyed',
    'crazy',
    'elegant',
    'sleepy',
    'sick',
    'toxic',
    'white',
    'black',
    'silly',
    'aging',
    'old',
    'terrified',
  ];

  const nouns = [
    'agent',
    'kitten',
    'king',
    'warrior',
    'flamingo',
    'anaconda',
    'gorilla',
    'man',
    'elephant',
    'car',
    'spider',
    'horse',
    'goat',
    'fish',
  ]

  const indexAdjectives = rndBetween(0, adjectives.length - 1)
  const indexNouns = rndBetween(0, nouns.length - 1)

  return adjectives[indexAdjectives] + '-' + nouns[indexNouns];
}

function rndBetween0And255() {
  return rndBetween(0, 255);
}

export function getRandomColorRGBAsString(): string {

  let red = rndBetween0And255().toString(16);
  let green = rndBetween0And255().toString(16);
  let blue = rndBetween0And255().toString(16);

  if (red.length < 2) {
    red = '0' + red;
  }

  if (green.length < 2) {
    green = '0' + green;
  }

  if (blue.length < 2) {
    blue = '0' + blue;
  }

  return '#' + red + green + blue;
}

function rnd(min, max){
  return (Math.floor(Math.pow(10,14)*Math.random()*Math.random())%(max-min+1))+min;
}

