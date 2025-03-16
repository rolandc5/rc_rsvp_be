const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const server = express();
server.use(cors());
server.use(express.json());

const auth = new google.auth.GoogleAuth({
  keyFile: './account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

let sheets;
auth.getClient().then(result => {
  sheets = google.sheets({
    version: 'v4',
    auth: result,
  });
});

server.get('/', async (req, res) => {
  try {
    const { name } = req.query;
    const range = [];
    const list = await sheets.spreadsheets.values.get({
      spreadsheetId: '1aQR6RLkfeDQ_SujGRyw_N4g_1LkTUm3ENGhgMCLuOAw',
      range: 'list!A2:H',
    });
    const sRsvp = list.data.values.find((personVal) => {
      console.log(personVal[2], name.toLowerCase());
      if (personVal.length !== 0 && `${personVal[1].toLowerCase()} ${personVal[3].toLowerCase()}` === name.toLowerCase()) {
        return personVal;
      } else if (personVal.length !== 0 && personVal[2].toLowerCase().includes(name.toLowerCase())) {
        return personVal;
      }
    });
    if (sRsvp === undefined || sRsvp.length === 0) {
      throw new Error('Could not find name in RSVP list');
    }
    const gRsvp = list.data.values.filter((group, i) => {
      if (sRsvp[4] === group[4]) {
        range.push(i + 2);
        return group;
      }
    });
    if (gRsvp === undefined || sRsvp.length === 0) {
      throw new Error('Could not retrieve Group Rsvp');
    }
    return res.status(200).json({ range: range, group: gRsvp});
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.post('/update', async (req, res) => {
  try {
    const list = await sheets.spreadsheets.values.update({
      spreadsheetId: '1aQR6RLkfeDQ_SujGRyw_N4g_1LkTUm3ENGhgMCLuOAw',
      range: `list!A${req.body.range[0]}:H${req.body.range[req.body.range.length - 1]}`,
      valueInputOption: 'USER_ENTERED',
      resource: {values: req.body.group}
    });
    if (list.status === 200) {
      return res.status(200).json({ message: 'Successfully updated the RSVP list' });
    }
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
});

server.listen((21790), () => {
  console.log(`Server Connected 21790`);
})