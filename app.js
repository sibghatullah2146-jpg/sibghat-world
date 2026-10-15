
"use strict";

// Sibghat World AI Worker
const WORKER_URL =
  "https://sibghat-world-ai.sibghatullah2146.workers.dev";

// Simplifier elements
const sourceText = document.getElementById("sourceText");
const language = document.getElementById("language");
const charCount = document.getElementById("charCount");
const clearButton = document.getElementById("clearButton");
const simplifyButton = document.getElementById("simplifyButton");
const resultBox = document.getElementById("resultBox");
const resultText = document.getElementById("resultText");
const copyButton = document.getElementById("copyButton");

// Translator elements
const translatorText = document.getElementById("translatorText");
const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");
const translatorCharCount = document.getElementById("translatorCharCount");
const translatorClearButton = document.getElementById("translatorClearButton");
const translateButton = document.getElementById("translateButton");
const translateResultBox = document.getElementById("translateResultBox");
const translateResultText = document.getElementById("translateResultText");
const translateCopyButton = document.getElementById("translateCopyButton");

const year = document.getElementById("year");

const languageNames = {
  auto: "Detect automatically",
  ur: "Urdu",
  roman: "Roman Urdu",
  en: "English",
  ar: "Arabic",
  hi: "Hindi",
  pa: "Punjabi",
  es: "Spanish",
  fr: "French",
  de: "German"
};

const messages = {
  en: {
    empty: "Please enter some text first.",
    working: "AI is simplifying your text...",
    error: "Something went wrong. Please try again.",
    copied: "Result copied!",
    copyError: "Copy failed. Please copy the result manually."
  },
  roman: {
    empty: "Pehle apna text likhein ya paste karein.",
    working: "AI aap ke text ko asaan bana raha hai...",
    error: "Kuch masla hua hai. Dobara koshish karein.",
    copied: "Result copy ho gaya!",
    copyError: "Copy nahi hua. Result ko khud copy karein."
  },
  ur: {
    empty: "براہِ کرم پہلے اپنا متن لکھیں یا پیسٹ کریں۔",
    working: "AI آپ کے متن کو آسان بنا رہا ہے...",
    error: "کوئی مسئلہ پیش آیا ہے۔ دوبارہ کوشش کریں۔",
    copied: "نتیجہ کاپی ہو گیا!",
    copyError: "کاپی نہیں ہو سکی۔ نتیجہ خود کاپی کریں۔"
  }
};

function getMessages() {
  return messages[language.value] || messages.en;
}

function showResult(box, element, message) {
  element.textContent = message;
  box.hidden = false;
}

function updateCharacterCount() {
  charCount.textContent = `${sourceText.value.length} / 5000`;
}

function updateTranslatorCharacterCount() {
  translatorCharCount.textContent =
    `${translatorText.value.length} / 5000`;
}

function updateCopyButton(button, text) {
  button.disabled = !text || !text.trim();
}

function showErrorMessage(error, fallbackMessage) {
  console.error("Sibghat World AI error:", error);

  if (error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

async function callAI(endpoint, payload) {
  const response = await fetch(`${WORKER_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The AI service returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data && data.error
        ? data.error
        : `AI request failed (${response.status}). Please try again.`
    );
  }

  if (typeof data.result !== "string" || !data.result.trim()) {
    throw new Error("The AI service returned an empty result.");
  }

  return data.result.trim();
}

async function copyText(text, button, successMessage, errorMessage, defaultLabel) {
  if (!text || !text.trim()) {
    return;
  }

  let copied = false;

  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const temporaryTextarea = document.createElement("textarea");

    temporaryTextarea.value = text;
    temporaryTextarea.style.position = "fixed";
    temporaryTextarea.style.opacity = "0";
    temporaryTextarea.style.pointerEvents = "none";

    document.body.appendChild(temporaryTextarea);
    temporaryTextarea.select();

    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    temporaryTextarea.remove();
  }

  button.textContent = copied ? successMessage : errorMessage;

  setTimeout(function () {
    button.textContent = defaultLabel;
  }, 2200);
}

// Set up the page
if (year) {
  year.textContent = new Date().getFullYear();
}

updateCharacterCount();
updateTranslatorCharacterCount();

// Simplifier: character counter
sourceText.addEventListener("input", updateCharacterCount);

// Simplifier: clear text
clearButton.addEventListener("click", function () {
  sourceText.value = "";
  updateCharacterCount();
  resultBox.hidden = true;
  resultText.textContent = "";
  copyButton.disabled = true;
  sourceText.focus();
});

// Simplifier: AI request
simplifyButton.addEventListener("click", async function () {
  const text = sourceText.value.trim();
  const currentMessages = getMessages();

  if (!text) {
    showResult(resultBox, resultText, currentMessages.empty);
    copyButton.disabled = true;
    return;
  }

  if (text.length > 5000) {
    showResult(resultBox, resultText, "Please use 5000 characters or fewer.");
    copyButton.disabled = true;
    return;
  }

  simplifyButton.disabled = true;
  copyButton.disabled = true;
  simplifyButton.textContent = currentMessages.working;
  showResult(resultBox, resultText, currentMessages.working);

  try {
    const result = await callAI("/api/simplify", {
      text: text,
      language: language.value
    });

    showResult(resultBox, resultText, result);
    copyButton.disabled = false;

    resultBox.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  } catch (error) {
    showResult(
      resultBox,
      resultText,
      showErrorMessage(
        error,
        currentMessages.error
      )
    );
    copyButton.disabled = true;
  } finally {
    simplifyButton.disabled = false;
    simplifyButton.textContent = "Make it easier →";
  }
});

// Simplifier: copy result
copyButton.addEventListener("click", async function () {
  if (copyButton.disabled) {
    return;
  }

  const currentMessages = getMessages();

  await copyText(
    resultText.textContent,
    copyButton,
    currentMessages.copied,
    currentMessages.copyError,
    "Copy result"
  );
});

// Translator: character counter
translatorText.addEventListener("input", updateTranslatorCharacterCount);

// Translator: clear text
translatorClearButton.addEventListener("click", function () {
  translatorText.value = "";
  updateTranslatorCharacterCount();
  translateResultBox.hidden = true;
  translateResultText.textContent = "";
  translateCopyButton.disabled = true;
  translatorText.focus();
});

// Translator: AI translation
translateButton.addEventListener("click", async function () {
  const text = translatorText.value.trim();

  if (!text) {
    showResult(
      translateResultBox,
      translateResultText,
      "Please enter some text to translate."
    );
    translateCopyButton.disabled = true;
    return;
  }

  if (text.length > 5000) {
    showResult(
      translateResultBox,
      translateResultText,
      "Please use 5000 characters or fewer."
    );
    translateCopyButton.disabled = true;
    return;
  }

  if (sourceLanguage.value === targetLanguage.value) {
    showResult(
      translateResultBox,
      translateResultText,
      "Please choose two different languages."
    );
    translateCopyButton.disabled = true;
    return;
  }

  const originalLabel = "Translate text →";

  translateButton.disabled = true;
  translateCopyButton.disabled = true;
  translateButton.textContent = "Translating...";
  showResult(
    translateResultBox,
    translateResultText,
    "AI is translating your text..."
  );

  try {
    const result = await callAI("/api/translate", {
      text: text,
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value
    });

    showResult(translateResultBox, translateResultText, result);
    translateCopyButton.disabled = false;

    translateResultBox.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  } catch (error) {
    showResult(
      translateResultBox,
      translateResultText,
      showErrorMessage(
        error,
        "Translation failed. Please try again."
      )
    );
    translateCopyButton.disabled = true;
  } finally {
    translateButton.disabled = false;
    translateButton.textContent = originalLabel;
  }
});

// Translator: copy translation
translateCopyButton.addEventListener("click", async function () {
  if (translateCopyButton.disabled) {
    return;
  }

  await copyText(
    translateResultText.textContent,
    translateCopyButton,
    "Translation copied!",
    "Copy failed. Please copy the translation manually.",
    "Copy translation"
  );
});

// Keep result buttons disabled until a result exists.
updateCopyButton(copyButton, "");
updateCopyButton(translateCopyButton, "");
