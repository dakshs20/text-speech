const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");
require("dotenv").config();

const { SpeechClient } = require("@google-cloud/speech");
const { TranslationServiceClient } = require("@google-cloud/translate").v3;
const textToSpeech = require("@google-cloud/text-to-speech");

const app = express();
app.use(express.static("public"));
app.use(express.json());

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Google clients
const speechClient = new SpeechClient();
const translateClient = new TranslationServiceClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

function mimeToEncoding(mimeType) {
  if (!mimeType) return "ENCODING_UNSPECIFIED";
  if (mimeType.includes("wav")) return "LINEAR16";
  if (mimeType.includes("flac")) return "FLAC";
  if (mimeType.includes("mp3")) return "MP3";
  return "ENCODING_UNSPECIFIED";
}

// POST /translate
app.post("/translate", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio uploaded" });

    const filePath = req.file.path;
    const mimeType = mime.lookup(filePath) || req.file.mimetype;
    const encoding = mimeToEncoding(mimeType);
    const content = fs.readFileSync(filePath).toString("base64");

    // 1) Speech-to-Text
    const speechRequest = {
      audio: { content },
      config: {
        encoding: encoding === "ENCODING_UNSPECIFIED" ? "MP3" : encoding,
        sampleRateHertz: 16000,
        languageCode: req.body.source_language || "hi-IN",
      },
    };
    const [sttResponse] = await speechClient.recognize(speechRequest);
    const transcription =
      sttResponse.results
        .map((r) => r.alternatives[0].transcript)
        .join("\n") || "";

    // 2) Translate
    const projectId =
      process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const location = "global";
    const parent = `projects/${projectId}/locations/${location}`;
    const translateRequest = {
      parent,
      contents: [transcription],
      mimeType: "text/plain",
      targetLanguageCode: req.body.target_lang || "hi",
    };
    const [translateResponse] = await translateClient.translateText(
      translateRequest
    );
    const translatedText =
      (translateResponse.translations &&
        translateResponse.translations[0].translatedText) ||
      "";

    // 3) Text-to-Speech
    const ttsRequest = {
      input: { text: translatedText },
      voice: { languageCode: "hi-IN", name: "hi-IN-Standard-A" },
      audioConfig: { audioEncoding: "MP3" },
    };
    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);

    const outFileName = `${Date.now()}-${uuidv4()}.mp3`;
    const outPath = path.join(UPLOAD_DIR, outFileName);
    fs.writeFileSync(outPath, ttsResponse.audioContent, "binary");

    res.json({
      transcription,
      translatedText,
      ttsAudio: `/files/${path.basename(outPath)}`,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Serve generated files
app.use("/files", express.static(UPLOAD_DIR));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));