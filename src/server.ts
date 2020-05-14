import axios from 'axios';
import fs from 'fs';
import { SHA1 } from 'crypto-js';

interface AnswerJson {
  numero_casas: number;
  token: string;
  cifrado: string;
  decifrado: string;
  resumo_criptografico: string;
}

const api = axios.create({
  baseURL: 'https://api.codenation.dev/v1/challenge/dev-ps',
});

const main = async (): Promise<void> => {
  const { data } = await api.get(
    '/generate-data?token=97a803786d1876893738c3357557a94384ba7490',
  );

  const jsonContent = JSON.stringify(data);

  fs.writeFile('./answer.json', jsonContent, error => {
    if (error) throw error;
    console.log('Saved');
  });

  fs.readFile('./answer.json', 'utf-8', (error, jsonObj) => {
    if (error) throw error;

    const readJson = JSON.parse(jsonObj) as AnswerJson;

    const maxUnicode = 'z'.charCodeAt(0);
    const minUnicode = 'a'.charCodeAt(0);
    const jumps = readJson.numero_casas % 26;

    readJson.decifrado = readJson.cifrado
      .split('')
      .map(encodedChar => {
        const charUnicode = encodedChar.charCodeAt(0);
        if (encodedChar.match(/[a-z]/)) {
          if (charUnicode - jumps < minUnicode) {
            // it has '-1' beacause starts counting by the previous element
            const relative_jumps = jumps - (charUnicode - minUnicode) - 1;
            return String.fromCharCode(maxUnicode - relative_jumps);
          }
          return String.fromCharCode(charUnicode - jumps);
        }
        return encodedChar;
      })
      .join('');
    readJson.resumo_criptografico = SHA1(readJson.decifrado).toString();
    fs.writeFile('./answer.json', JSON.stringify(readJson), err => {
      if (err) throw err;
      console.log('File updated');
    });
  });
};

main();
