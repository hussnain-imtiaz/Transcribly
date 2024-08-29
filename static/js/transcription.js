document.addEventListener('DOMContentLoaded', () => {
    const recordIcon = document.getElementById('recordIcon');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton');
    const stopButton = document.getElementById('stopButton');
    const resetButton = document.getElementById('resetButton');
    const saveDropdown = document.getElementById('saveDropdown');
    const exportPdfButton = document.getElementById('exportPdfButton');
    const exportDocxButton = document.getElementById('exportDocxButton');
    const summarizeButton = document.getElementById('summarizeButton');
    const liveTranscription = document.getElementById('liveTranscription');
    const aiNotes = document.getElementById('aiNotes');
    const userNotes = document.getElementById('userNotes');
    const timer = document.getElementById('timer');
    const translateDropdown = document.getElementById('translateDropdown');

    let isRecording = false;
    let isPaused = false;
    let recognition;
    let startTime;
    let elapsedTime = 0;
    let globalStartTime;
    let timerInterval;
    let transcriptionText = '';
    let speakerCounter = 1;
    let lastSpeaker = '';

    const CHUNK_LIMIT_MS = 10000;  // 10 seconds limit
    const LETTER_INTERVAL_MS = 20;  // Speed of letter-by-letter animation

    function updateTimer() {
        const time = new Date(Date.now() - globalStartTime + elapsedTime);
        const hours = time.getUTCHours().toString().padStart(2, '0');
        const minutes = time.getUTCMinutes().toString().padStart(2, '0');
        const seconds = time.getUTCSeconds().toString().padStart(2, '0');
        timer.textContent = `${hours}:${minutes}:${seconds}`;
    }

    function startTimer() {
        globalStartTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        elapsedTime += Date.now() - globalStartTime;
    }

    function resetTimer() {
        clearInterval(timerInterval);
        elapsedTime = 0;
        timer.textContent = "00:00:00";
    }

    function initializeRecognition() {
        const selectedLanguage = document.getElementById('languageDropdown').value;
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = selectedLanguage;
        recognition.continuous = true;
        recognition.interimResults = true;

        let chunkStartTime = Date.now();

        recognition.onresult = (event) => {
            let interim_transcript = '';
            let final_transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                const speaker = detectSpeaker(transcript);
                const isFinal = event.results[i].isFinal;

                if (isFinal) {
                    final_transcript += transcript;
                    const elapsedChunkTime = Date.now() - chunkStartTime;

                    if (!transcript.endsWith('.') && !transcript.endsWith('!') && !transcript.endsWith('?')) {
                        final_transcript += '. ';
                    }

                    if (elapsedChunkTime >= CHUNK_LIMIT_MS) {
                        addTranscriptionWithTimestamp(transcript, speaker, confidence);
                        chunkStartTime = Date.now();
                    } else {
                        addTranscriptionWithTimestamp(transcript, speaker, confidence, true);
                    }

                    const selectedTranslationLanguage = translateDropdown.value;
                    if (selectedTranslationLanguage) {
                        translateText(final_transcript, selectedTranslationLanguage);
                    }
                } else {
                    interim_transcript += transcript;
                }
            }
            transcriptionText += final_transcript;
        };

        recognition.onend = () => {
            if (isRecording && !isPaused) {
                recognition.start();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error detected: ' + event.error);
            if (isRecording && !isPaused) {
                recognition.start();
            }
        };
    }

    function typeText(targetElement, text, callback = null) {
        let index = 0;
        targetElement.innerHTML = '';  // Clear the target element

        function type() {
            if (index < text.length) {
                const char = text.charAt(index);
                targetElement.innerHTML += char;
                index++;
                setTimeout(type, LETTER_INTERVAL_MS);
            } else {
                if (callback) callback();  // Execute the callback function if provided
            }
        }
        type();
    }

    function startRecording() {
        isRecording = true;
        isPaused = false;
        recordIcon.classList.add('recording');
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        stopButton.style.display = 'inline-block';
        resetButton.style.display = 'inline-block';
        saveDropdown.style.display = 'none';
        summarizeButton.disabled = true;

        if (!recognition) {
            initializeRecognition();
        }
        recognition.start();
        startTimer();
    }

    function stopRecording() {
        isRecording = false;
        isPaused = false;
        recordIcon.classList.remove('recording');
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
        resumeButton.style.display = 'none';
        stopButton.style.display = 'none';
        resetButton.style.display = 'none';
        saveDropdown.style.display = 'inline-block';
        summarizeButton.disabled = false;
        stopTimer();
        resetTimer();

        if (recognition) {
            recognition.stop();
            recognition = null;
        }
    }

    function pauseRecording() {
        isPaused = true;
        if (recognition) {
            recognition.stop();
        }
        stopTimer();
        pauseButton.style.display = 'none';
        resumeButton.style.display = 'inline-block';
    }

    function resumeRecording() {
        isPaused = false;
        if (!recognition) {
            initializeRecognition();
        }
        recognition.start();
        startTimer();
        resumeButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
    }

    function detectSpeaker(transcript) {
        if (transcript.includes('Mr.') || transcript.includes('Ms.') || transcript.includes('Speaker')) {
            speakerCounter++;
            return `Speaker ${speakerCounter}`;
        }
        return lastSpeaker || `Speaker ${speakerCounter}`;
    }

    function addTranscriptionWithTimestamp(text, speaker, confidence, isInterim = false) {
        const timestamp = timer.textContent;
        const paragraph = document.createElement('p');
        paragraph.classList.add(isInterim ? 'interim' : 'final');

        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('timestamp');
        timestampSpan.style.color = '#ffd700'; // Goldish color
        timestampSpan.textContent = `[${timestamp}] `;

        const speakerSpan = document.createElement('span');
        speakerSpan.classList.add('speaker');
        speakerSpan.style.color = '#1e90ff'; // Blue color for speaker
        speakerSpan.style.fontWeight = 'bold';
        speakerSpan.textContent = `${speaker}: `;

        paragraph.appendChild(timestampSpan);
        paragraph.appendChild(speakerSpan);

        let index = 0;

        function type() {
            if (index < text.length) {
                const char = text.charAt(index);
                paragraph.innerHTML += char;

                if (confidence < 0.6 && char !== ' ') {
                    paragraph.style.backgroundColor = '#ffcccc'; // Light red for low confidence
                }

                index++;
                setTimeout(type, LETTER_INTERVAL_MS);
            } else {
                if (!isInterim) {
                    paragraph.classList.remove('interim');
                    paragraph.classList.add('final');
                    lastSpeaker = speaker;
                }
            }
        }
        type();

        liveTranscription.appendChild(paragraph);
        liveTranscription.scrollTop = liveTranscription.scrollHeight; // Auto-scroll to the bottom
    }

    function resetTranscription() {
        liveTranscription.innerHTML = '';
        userNotes.value = '';
        aiNotes.innerHTML = '';
        transcriptionText = '';
        resetTimer();
        recordIcon.classList.remove('recording');
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
        resumeButton.style.display = 'none';
        stopButton.style.display = 'none';
        resetButton.style.display = 'none';
        saveDropdown.style.display = 'none';
        summarizeButton.disabled = true;
        isRecording = false;
        isPaused = false;
        recognition = null;
        speakerCounter = 1;
        lastSpeaker = '';
    }

    function formatText(command) {
        document.execCommand(command, false, null);
    }

    function highlightText() {
        document.execCommand('backColor', false, '#ffff00'); // Highlight with yellow
        document.execCommand('foreColor', false, '#000000'); // Change text color to black
    }

    function markAsImportant() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText) {
            const timestamp = timer.textContent;
            document.getElementById('userNotes').value += `• [${timestamp}] ${selectedText}\n`; // Add as a bullet point
            document.execCommand('foreColor', false, '#ff4500'); // Mark as important with orange-red color
        }
    }

    function removeFormatting() {
        document.execCommand('removeFormat', false, null);
    }

    function exportAsPdf() {
        const transcription = transcriptionText;
        fetch('/export/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `transcription=${encodeURIComponent(transcription)}`,
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transcription.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    }

    function exportAsDocx() {
        const transcription = transcriptionText;
        fetch('/export/docx', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `transcription=${encodeURIComponent(transcription)}`,
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transcription.docx';
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    }

    function summarizeText() {
        const transcription = transcriptionText;
        fetch('/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `transcription=${encodeURIComponent(transcription)}`,
        })
        .then(response => response.json())
        .then(data => {
            const summaryElement = document.getElementById('aiNotes');
            const summaryText = data.summary;
            typeText(summaryElement, summaryText);  // Type the summary text with effect
        });
    }

    function translateText(text, targetLanguage) {
        fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `text=${encodeURIComponent(text)}&targetLanguage=${encodeURIComponent(targetLanguage)}`,
        })
        .then(response => response.json())
        .then(data => {
            const translatedText = data.translatedText;
            const translationParagraph = document.createElement('p');
            translationParagraph.style.color = '#32CD32'; // Greenish color for translation
            translationParagraph.textContent = translatedText;
            liveTranscription.appendChild(translationParagraph);
            liveTranscription.scrollTop = liveTranscription.scrollHeight; // Auto-scroll to the bottom
        });
    }

    // Event listeners
    startButton.addEventListener('click', startRecording);
    pauseButton.addEventListener('click', pauseRecording);
    resumeButton.addEventListener('click', resumeRecording);
    stopButton.addEventListener('click', stopRecording);
    resetButton.addEventListener('click', resetTranscription);
    exportPdfButton.addEventListener('click', exportAsPdf);
    exportDocxButton.addEventListener('click', exportAsDocx);
    summarizeButton.addEventListener('click', summarizeText);

    // Editor buttons
    document.getElementById('boldButton').addEventListener('click', () => formatText('bold'));
    document.getElementById('italicButton').addEventListener('click', () => formatText('italic'));
    document.getElementById('underlineButton').addEventListener('click', () => formatText('underline'));
    document.getElementById('highlightButton').addEventListener('click', highlightText);
    document.getElementById('importantButton').addEventListener('click', markAsImportant);
    document.getElementById('clearFormatButton').addEventListener('click', removeFormatting);
});