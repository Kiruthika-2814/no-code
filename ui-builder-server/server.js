const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Paths
const SAMPLE_JSON_PATH = path.join(__dirname, '../no-code-angular/json/sample-page.json');
const UI_JSON_PATH = path.join(__dirname, '../no-code-angular/json/ui.json');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

// GET endpoint to serve the sample-page.json
app.get('/sample-page', (req, res) => {
  try {
    const data = fs.readFileSync(SAMPLE_JSON_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST endpoint to save updated UI JSON
app.post('/save-ui', (req, res) => {
  try {
    fs.writeFileSync(UI_JSON_PATH, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true, message: 'UI saved successfully to ui.json' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`UI Builder API running at http://localhost:${PORT}`);
});
