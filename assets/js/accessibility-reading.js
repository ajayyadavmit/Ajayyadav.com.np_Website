
(() => {
  "use strict";

  // -----------------------------------------
  // 1. STORE SELECTED TEXT
  // -----------------------------------------

  let selectedText = "";

  function getSelectedText() {
    return window.getSelection()?.toString().trim() || "";
  }

  // Remember the selection whenever it changes.
  document.addEventListener("selectionchange", () => {
    const text = getSelectedText();

    if (text) {
      selectedText = text;
    }
  });

  // Capture selection before a button receives focus.
  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest("#accessibility-widget")) {
      const text = getSelectedText();

      if (text) {
        selectedText = text;
      }
    }
  }, true);


  // -----------------------------------------
  // 2. INITIALISE READING AND DICTIONARY TOOLS
  // -----------------------------------------

  function initialiseReadingTools() {

    const readPageButton =
      document.getElementById("a11y-read-page");

    const readSelectionButton =
      document.getElementById("a11y-read-selection");

    const pauseButton =
      document.getElementById("a11y-pause-speech");

    const stopButton =
      document.getElementById("a11y-stop-speech");

    const speechStatus =
      document.getElementById("a11y-speech-status");

    const lookupButton =
      document.getElementById("a11y-lookup-word");

    const dictionaryResult =
      document.getElementById("a11y-dictionary-result");

    // Wait until the accessibility widget is available.
    if (
      !readPageButton ||
      !readSelectionButton ||
      !pauseButton ||
      !stopButton ||
      !speechStatus ||
      !lookupButton ||
      !dictionaryResult
    ) {
      return false;
    }

    // Prevent duplicate event listeners.
    if (readPageButton.dataset.initialised === "true") {
      return true;
    }

    readPageButton.dataset.initialised = "true";


    // -----------------------------------------
    // 3. TEXT-TO-SPEECH
    // -----------------------------------------

    if (!("speechSynthesis" in window)) {
      speechStatus.textContent =
        "Text-to-Speech is not supported by this browser.";

      readPageButton.disabled = true;
      readSelectionButton.disabled = true;
      pauseButton.disabled = true;
      stopButton.disabled = true;

    } else {

      function speakText(text) {

        const cleanText = text.trim();

        if (!cleanText) {
          speechStatus.textContent = "No text available to read.";
          return;
        }

        // Stop any previous speech.
        window.speechSynthesis.cancel();

        // Split long text into manageable sections.
        const chunks = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];

        let index = 0;

        function speakNextChunk() {

          if (index >= chunks.length) {
            speechStatus.textContent = "Reading completed.";
            return;
          }

          const chunk = chunks[index].trim();
          index++;

          if (!chunk) {
            speakNextChunk();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunk);

          utterance.lang = "en-US";
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.volume = 1;

          utterance.onstart = () => {
            speechStatus.textContent = "Reading...";
          };

          utterance.onend = () => {
            speakNextChunk();
          };

          utterance.onerror = (event) => {
            speechStatus.textContent =
              "Speech error: " + event.error;
          };

          window.speechSynthesis.speak(utterance);
        }

        speakNextChunk();
      }


      // Read the main page content.
      readPageButton.addEventListener("click", () => {

        const currentSelection = getSelectedText();
        const textToRead = currentSelection || selectedText;

        if (textToRead) {
          speakText(textToRead);
          return;
        }

        const mainContent =
          document.getElementById("main-content");

        if (!mainContent) {
          speechStatus.textContent =
            "Main page content could not be found.";
          return;
        }

        speakText(mainContent.innerText);
      });


      // Read only selected text.
      readSelectionButton.addEventListener("click", () => {

        const text =
          getSelectedText() || selectedText;

        if (!text) {
          speechStatus.textContent =
            "Please select some text on the page first.";
          return;
        }

        speakText(text);
      });


      // Pause or resume speech.
      pauseButton.addEventListener("click", () => {

        const speech = window.speechSynthesis;

        if (speech.speaking && !speech.paused) {
          speech.pause();
          speechStatus.textContent = "Speech paused.";

        } else if (speech.paused) {
          speech.resume();
          speechStatus.textContent = "Speech resumed.";

        } else {
          speechStatus.textContent =
            "There is no speech to pause.";
        }
      });


      // Stop speech.
      stopButton.addEventListener("click", () => {

        window.speechSynthesis.cancel();

        speechStatus.textContent = "Speech stopped.";
      });
    }


    // -----------------------------------------
    // 4. DICTIONARY
    // -----------------------------------------

    lookupButton.addEventListener("click", async () => {

      const word =
        getSelectedText() || selectedText;

      dictionaryResult.hidden = false;
      dictionaryResult.textContent = "";

      // Dictionary supports one English word at a time.
      if (!word) {
        dictionaryResult.textContent =
          "Please select an English word first.";
        return;
      }

      if (!/^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/.test(word)) {
        dictionaryResult.textContent =
          "Please select one English word, not a sentence or phrase.";
        return;
      }

      dictionaryResult.textContent =
        "Looking up: " + word + "...";

      lookupButton.disabled = true;

      try {

        const response = await fetch(
          "https://api.dictionaryapi.dev/api/v2/entries/en/" +
          encodeURIComponent(word)
        );

        if (!response.ok) {
          throw new Error("Word not found.");
        }

        const data = await response.json();

        const entry = data[0];

        dictionaryResult.replaceChildren();

        const heading = document.createElement("h4");
        heading.textContent = entry.word;
        dictionaryResult.appendChild(heading);

        if (entry.phonetic) {
          const phonetic = document.createElement("p");
          phonetic.textContent = entry.phonetic;
          dictionaryResult.appendChild(phonetic);
        }

        const meanings = entry.meanings || [];

        meanings.slice(0, 3).forEach((meaning) => {

          const section = document.createElement("div");

          const partOfSpeech = document.createElement("strong");
          partOfSpeech.textContent = meaning.partOfSpeech || "Meaning";

          section.appendChild(partOfSpeech);

          const definitions = meaning.definitions || [];

          definitions.slice(0, 2).forEach((definition) => {

            const paragraph = document.createElement("p");
            paragraph.textContent = definition.definition;

            section.appendChild(paragraph);

            if (definition.example) {
              const example = document.createElement("p");
              example.textContent =
                "Example: " + definition.example;

              section.appendChild(example);
            }
          });

          dictionaryResult.appendChild(section);
        });

      } catch (error) {

        dictionaryResult.textContent =
          "Sorry, the definition could not be loaded. " +
          "Please check the spelling or try again.";

        console.error("Dictionary error:", error);

      } finally {

        lookupButton.disabled = false;
      }
    });

    return true;
  }


  // -----------------------------------------
  // 5. WAIT FOR THE ACCESSIBILITY WIDGET
  // -----------------------------------------

  function startReadingTools() {

    if (initialiseReadingTools()) {
      return;
    }

    const observer = new MutationObserver(() => {

      if (initialiseReadingTools()) {
        observer.disconnect();
      }

    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start after the document is ready.
  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      startReadingTools,
      { once: true }
    );

  } else {

    startReadingTools();
  }

})();
