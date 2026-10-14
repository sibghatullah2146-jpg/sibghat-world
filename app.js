const sourceText = document.getElementById("sourceText");
const language = document.getElementById("language");
const charCount = document.getElementById("charCount");
const clearButton = document.getElementById("clearButton");
const simplifyButton = document.getElementById("simplifyButton");
const resultBox = document.getElementById("resultBox");
const resultText = document.getElementById("resultText");
const copyButton = document.getElementById("copyButton");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

function updateCharacterCount() {
  charCount.textContent = `${sourceText.value.length} / 5000`;
}

sourceText.addEventListener("input", updateCharacterCount);

clearButton.addEventListener("click", function () {
  sourceText.value = "";
  updateCharacterCount();
  resultBox.hidden = true;
  sourceText.focus();
});

const examples = {
  en: {
    "the meeting has been postponed until further notice.":
      "The meeting will happen later. A new date has not been announced yet.",
    "please submit the required documents at your earliest convenience.":
      "Please send the needed documents as soon as you can."
  },
  roman: {
    "the meeting has been postponed until further notice.":
      "Meeting baad mein hogi. Abhi nayi tareekh nahi batayi gayi.",
    "please submit the required documents at your earliest convenience.":
      "Meherbani karke zaroori documents jald se jald bhej dein."
  },
  ur: {
    "the meeting has been postponed until further notice.":
      "اجلاس ملتوی کر دیا گیا ہے۔ ابھی نئی تاریخ نہیں بتائی گئی۔",
    "please submit the required documents at your earliest convenience.":
      "براہِ کرم ضروری دستاویزات جلد از جلد جمع کروا دیں۔"
  }
};

const messages = {
  en: {
    empty: "Please enter some text first.",
    demo: "This is an early demo, not a real AI simplifier. It can simplify only a few built-in example sentences so far. Try one of the example sentences below.",
    original: "Your original text:",
    copied: "Result copied!",
    copyError: "Automatic copying did not work. Please select and copy the result manually."
  },
  roman: {
    empty: "Pehle apna text likhein ya paste karein.",
    demo: "Yeh ibtidai demo hai, asal AI nahi. Filhaal yeh sirf kuch pehle se mojood example sentences ko asaan bana sakta hai. Neeche diye gaye example sentences mein se koi try karein.",
    original: "Aap ka asal text:",
    copied: "Result copy ho gaya!",
    copyError: "Copy automatic nahi hua. Meherbani karke result ko khud select karke copy karein."
  },
  ur: {
    empty: "براہِ کرم پہلے اپنا متن لکھیں یا پیسٹ کریں۔",
    demo: "یہ ابتدائی ڈیمو ہے، حقیقی AI نہیں۔ فی الحال یہ صرف چند پہلے سے موجود مثالوں کو آسان بنا سکتا ہے۔ نیچے دیے گئے جملوں میں سے کوئی ایک آزما کر دیکھیں۔",
    original: "آپ کا اصل متن:",
    copied: "نتیجہ کاپی ہو گیا!",
    copyError: "خودکار کاپی نہیں ہو سکی۔ براہِ کرم نتیجے کو خود منتخب کرکے کاپی کریں۔"
  }
};

simplifyButton.addEventListener("click", function () {
  const text = sourceText.value.trim();
  const selectedLanguage = language.value;
  const currentMessages = messages[selectedLanguage] || messages.en;

  resultBox.hidden = false;

  if (!text) {
    resultText.textContent = currentMessages.empty;
    return;
  }

  const normalizedText = text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  const result = examples[selectedLanguage][normalizedText];

  if (result) {
    resultText.textContent = result;
  } else {
    resultText.textContent =
      currentMessages.demo + "\n\n" +
      currentMessages.original + "\n" + text;
  }

  resultBox.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

copyButton.addEventListener("click", async function () {
  const text = resultText.textContent;

  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = messages[language.value].copied;
  } catch (error) {
    const temporaryTextarea = document.createElement("textarea");
    temporaryTextarea.value = text;
    temporaryTextarea.style.position = "fixed";
    temporaryTextarea.style.opacity = "0";
    document.body.appendChild(temporaryTextarea);
    temporaryTextarea.select();

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch (copyError) {
      copied = false;
    }

    temporaryTextarea.remove();

    copyButton.textContent = copied
      ? messages[language.value].copied
      : messages[language.value].copyError;
  }

  setTimeout(function () {
    copyButton.textContent = "Copy result";
  }, 2000);
});

updateCharacterCount();