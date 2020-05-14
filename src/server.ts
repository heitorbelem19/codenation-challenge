import axios from 'axios';
import fs from 'fs';
import { SHA1 } from 'crypto-js';
import FormData from 'form-data';
import Configuration from './config/api';

interface AnswerJson {
  numero_casas: number;
  token: string;
  cifrado: string;
  decifrado: string;
  resumo_criptografico: string;
}

const config = new Configuration();
const { api } = config;
const { token } = config;

const main = async (): Promise<void> => {
  const data = (await api.get(`/generate-data?token=${token}`))
    .data as AnswerJson;

  const maxUnicode = 'z'.charCodeAt(0);
  const minUnicode = 'a'.charCodeAt(0);
  const jumps = data.numero_casas % 26;

  data.decifrado = data.cifrado
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

  data.resumo_criptografico = SHA1(data.decifrado).toString();

  fs.writeFile('./answer.json', JSON.stringify(data), err => {
    if (err) throw err;
    console.log('File updated');
  });

  try {
    const formData = new FormData();
    formData.append('answer', fs.createReadStream('./answer.json'));

    const headers = formData.getHeaders();

    const { response } = await axios.post(
      `/submit-solution?token=${token}`,
      formData,
      { headers },
    );

    return response.data;
  } catch (err) {
    throw new Error(err.message);
  }
};

main();
