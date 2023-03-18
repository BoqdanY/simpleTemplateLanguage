'use strict';

const fs = require('fs');

async function readFile(file, str = null) {
  try {
    const data = await fs.promises.readFile(file, 'utf-8');
    return data;
  } catch (e) {
    throw new Error(`No such file ${file} in: ${str.trim()}`);
  }
}

async function fnInclude(data) {
  const res = [];
  const regexp = /{{include "(.*?)"}}/;

  for (let row of data) {
    if (row.includes('{{include')) {
      const parsedRow = row.match(regexp);

      if (parsedRow) {
        const fileData = await readFile(parsedRow[1], parsedRow.input);
        row = row.slice(0, parsedRow.index) + fileData + row.slice(parsedRow.index + parsedRow[0].length);
      } else {
        throw new Error('No file name');
      }
    }
    res.push(row);
  }

  return res;
}

async function fnVariables(data, options) {
  const res = [];
  const regexp = /{{(.*?)}}/;

  for (let row of data) {
    if (row.includes('{{')) {
      const parsedRow = row.match(regexp);

      if (parsedRow[1].trim() !== '') {
        console.log(parsedRow[1]);
        row = row.slice(0, parsedRow.index) + options[parsedRow[1].trim()] + row.slice(parsedRow.index + parsedRow[0].length);
      } else {
        row = row.slice(0, parsedRow.index) + row.slice(parsedRow.index + parsedRow[0].length);
      }
    }
    res.push(row);
  }

  return res;
}

async function fnIfStatement(data, option) {
  const res = [];
  const regexp = /{{if\((.*?)\)(.*?)}}/;

  for (let row of data) {
    if (row.includes('{{')) {
      const parsedRow = row.match(regexp);
      if (parsedRow !== null) {
        console.log(parsedRow);
        console.log(parsedRow[1]);
        if (option[parsedRow[1]]) {
          row = row.slice(0, parsedRow.index) + parsedRow[2] + row.slice(parsedRow.index + parsedRow[0].length);
        } else {
          row = row.slice(0, parsedRow.index) + row.slice(parsedRow.index + parsedRow[0].length);
        }
      }
    }
    res.push(row);
  }

  return res;
}

async function render(file, option) {
  let data = await readFile(file);
  data = data.split('\n');
  data = await fnInclude(data);
  data = await fnIfStatement(data, option);
  data = await fnVariables(data, option);
  return data.join('\n');
}

(async () => {
  const res = await render('some.html', { title: 'home', home: true, notes: true});
  console.log(res);
})();