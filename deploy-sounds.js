const dbHelper = require('./shared/db');
const state = require('./shared/state');

dbHelper.importRecords(state.soundMap);