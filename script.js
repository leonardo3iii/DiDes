window.STORIES = window.STORIES || [];
const stories = window.STORIES;

let currentStory = null;
let currentStep = 0;
let practiceSeconds = 0;
let correctSentences = 0;
let typedWords = 0;
let timerInterval = null;

const STORAGE_KEY = "digiteEAvanceProgress";
const FONT_SIZE_KEY = "digiteEAvanceFontSize";

/* ====================== UTILITÁRIOS ====================== */

function normalizeText(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:'"“”‘’()\[\]{}…—–\-]/g, "")
        .replace(/\s+/g, " ");
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(secs).padStart(2, "0")
    );
}

function formatPracticeTime(seconds) {
    if (seconds <= 0) return "0 segundos";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let parts = [];

    if (hours > 0) {
        parts.push(hours + (hours === 1 ? " hora" : " horas"));
    }
    if (minutes > 0) {
        parts.push(minutes + (minutes === 1 ? " minuto" : " minutos"));
    }
    if (secs > 0 || parts.length === 0) {
        parts.push(secs + (secs === 1 ? " segundo" : " segundos"));
    }

    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return parts[0] + " e " + parts[1];
    return parts[0] + ", " + parts[1] + " e " + parts[2];
}

/* ====================== PROGRESSO (por história) ====================== */

function loadAllProgress() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveProgress() {
    if (!currentStory) return;

    const allProgress = loadAllProgress();
    const historyElement = document.getElementById("history");

    allProgress[currentStory.id] = {
        currentStep: currentStep,
        correctSentences: correctSentences,
        typedWords: typedWords,
        practiceSeconds: practiceSeconds,
        history: historyElement ? historyElement.innerHTML : "",
        completed: currentStep >= currentStory.steps.length
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
}

function loadProgress(storyId) {
    const all = loadAllProgress();
    return all[storyId] || null;
}

/* ====================== FONTE ====================== */

function getFontSize() {
    return parseInt(localStorage.getItem(FONT_SIZE_KEY)) || 18;
}

function applyFontSize() {
    const size = getFontSize();

    document.body.style.fontSize = size + "px";
    document.documentElement.style.fontSize = size + "px";

    document.querySelectorAll(".story-text").forEach(el => {
        el.style.fontSize = (size * 1.35) + "px";
    });

    document.querySelectorAll(".story-card h3").forEach(el => {
        el.style.fontSize = (size * 1.25) + "px";
    });

    document.querySelectorAll(".title h1").forEach(el => {
        el.style.fontSize = (size * 1.6) + "px";
    });
}

function increaseFont() {
    let size = getFontSize();
    if (size < 36) size += 2;
    localStorage.setItem(FONT_SIZE_KEY, size);
    applyFontSize();
}

function decreaseFont() {
    let size = getFontSize();
    if (size > 12) size -= 2;
    localStorage.setItem(FONT_SIZE_KEY, size);
    applyFontSize();
}

/* ====================== TIMER ====================== */

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        practiceSeconds++;
        saveProgress();

        const display = document.getElementById("timerDisplay");
        if (display) {
            display.textContent = formatTime(practiceSeconds);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

/* ====================== UI HELPERS ====================== */

function scrollToBottom() {
    setTimeout(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });
    }, 50);
}

function focusInput() {
    const input = document.getElementById("answer");
    if (input && !input.disabled) {
        input.focus();
    }
}

function getPrompt() {
    if (!currentStory) return "PS C:\\DiDes>";

    const title = currentStory.title
        .replace(/🏨|👻|🔑|📖/g, "")
        .trim();

    return `PS C:\\DiDes\\${title}>`;
}

/* ====================== TELAS ====================== */

function renderHome() {
    stopTimer();

    document.getElementById("homeScreen").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";

    const allProgress = loadAllProgress();

    let html = `
        <div class="font-controls">
            <span class="font-button" onclick="decreaseFont()">A-</span>
            <span class="font-button" onclick="increaseFont()">A+</span>
        </div>
        <div class="title">
            <h1>PS C:\\DiDes</h1>
            <p>Selecione uma história</p>
        </div>
    `;

    stories.forEach(story => {
        const progress = allProgress[story.id];
        let statusText = "";

        if (progress) {
            if (progress.completed) {
                statusText = `<p class="status completed">✓ Concluída</p>`;
            } else {
                statusText = `
                    <p class="status continue">
                        Continuar da etapa ${progress.currentStep + 1} de ${story.steps.length}
                    </p>
                `;
            }
        }

        html += `
            <div class="story-card" onclick="openStory('${story.id}')">
                <h3>${story.title}</h3>
                <p>${story.description}</p>
                ${statusText}
            </div>
        `;
    });

    document.getElementById("homeScreen").innerHTML = html;
    applyFontSize();
}

function openStory(storyId) {
    currentStory = stories.find(story => story.id === storyId);

    if (!currentStory || !currentStory.steps || currentStory.steps.length === 0) {
        alert("História não encontrada ou inválida.");
        return;
    }

    const progress = loadProgress(storyId);

    // Reset ou carrega progresso desta história
    if (progress) {
        currentStep = progress.currentStep || 0;
        correctSentences = progress.correctSentences || 0;
        typedWords = progress.typedWords || 0;
        practiceSeconds = progress.practiceSeconds || 0;
    } else {
        currentStep = 0;
        correctSentences = 0;
        typedWords = 0;
        practiceSeconds = 0;
    }

    // Proteção de bounds
    if (currentStep > currentStory.steps.length) {
        currentStep = currentStory.steps.length;
    }

    document.getElementById("homeScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";

    const isCompleted = currentStep >= currentStory.steps.length;

    document.getElementById("gameScreen").innerHTML = `
        <div class="font-controls">
            <span class="font-button" onclick="decreaseFont()">A-</span>
            <span class="font-button" onclick="increaseFont()">A+</span>
            <div class="timer-label">Tempo</div>
            <div id="timerDisplay" class="timer-display">${formatTime(practiceSeconds)}</div>
        </div>

        <div class="history" id="history"></div>

        <div class="answer-line">
            <span class="prompt">${getPrompt()}</span>
            <input id="answer" autocomplete="off" spellcheck="false" ${isCompleted ? "disabled" : ""}>
        </div>

        <div class="command-bar">
            <div class="command" onclick="renderHome()">← voltar para catálogo</div>
            ${!isCompleted ? `<div class="command" onclick="checkAnswer()">enter = validar</div>` : ""}
        </div>
    `;

    const historyElement = document.getElementById("history");

    if (progress && progress.history) {
        historyElement.innerHTML = progress.history;
    } else if (!isCompleted) {
        renderCurrentStep();
    }

    // Se já estava concluída, mostra a mensagem final novamente (caso o histórico tenha sido limpo)
    if (isCompleted && (!progress || !progress.history)) {
        historyElement.innerHTML = `
            <div class="success">
                🏆 HISTÓRIA CONCLUÍDA
                <br><br>
                ✅ ${correctSentences} frases corretas
                <br><br>
                📝 ${typedWords} palavras digitadas
                <br><br>
                ⏱ ${formatPracticeTime(practiceSeconds)} de prática
            </div>
        `;
    }

    const input = document.getElementById("answer");

    if (input && !isCompleted) {
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                checkAnswer();
            }
        });

        input.addEventListener("paste", function (event) {
            event.preventDefault();
        });
    }

    scrollToBottom();
    focusInput();

    if (!isCompleted) {
        startTimer();
    } else {
        stopTimer();
    }

    applyFontSize();
}

function renderCurrentStep() {
    if (!currentStory || currentStep >= currentStory.steps.length) return;

    const history = document.getElementById("history");
    const step = currentStory.steps[currentStep];

    history.innerHTML += `
        <div class="story-block">
            <div class="step-number">
                [${String(currentStep + 1).padStart(3, "0")}/${String(currentStory.steps.length).padStart(3, "0")}]
            </div>
            <div class="story-text">
                ${step.portugueseText}
            </div>
            <div class="choice">
                <span class="choice-label">Curta:</span>
                ${step.easy}
            </div>
            <div class="choice">
                <span class="choice-label">Média:</span>
                ${step.medium}
            </div>
            <div class="choice">
                <span class="choice-label">Longa:</span>
                ${step.advanced}
            </div>
            <div class="choice">
                <span class="choice-label">Especialista:</span>
                ${step.expert}
            </div>
        </div>
    `;

    saveProgress();
    scrollToBottom();
    focusInput();
    applyFontSize();
}

function checkAnswer() {
    if (!currentStory || currentStep >= currentStory.steps.length) return;

    const step = currentStory.steps[currentStep];
    const input = document.getElementById("answer");
    const answer = input.value.trim();
    const history = document.getElementById("history");

    if (!answer) {
        focusInput();
        return;
    }

    const normalizedAnswer = normalizeText(answer);

    const isCorrect =
        normalizedAnswer === normalizeText(step.easy) ||
        normalizedAnswer === normalizeText(step.medium) ||
        normalizedAnswer === normalizeText(step.advanced) ||
        normalizedAnswer === normalizeText(step.expert);

    if (isCorrect) {
        history.innerHTML += `
            <div class="success">
                ${getPrompt()} ${answer}
                ✓ Correto
            </div>
        `;

        correctSentences++;
        typedWords += answer.trim().split(/\s+/).filter(Boolean).length;
        currentStep++;

        input.value = "";
        saveProgress();

        if (currentStep < currentStory.steps.length) {
            renderCurrentStep();
        } else {
            // História concluída
            stopTimer();

            history.innerHTML += `
                <div class="success">
                    🏆 HISTÓRIA CONCLUÍDA
                    <br><br>
                    ✅ ${correctSentences} frases corretas
                    <br><br>
                    📝 ${typedWords} palavras digitadas
                    <br><br>
                    ⏱ ${formatPracticeTime(practiceSeconds)} de prática
                </div>
            `;

            input.disabled = true;
            saveProgress();
            scrollToBottom();
        }
    } else {
        history.innerHTML += `
            <div class="error">
                ${getPrompt()} ${answer}
                ✗ Frase incorreta
            </div>
        `;

        input.value = "";
        saveProgress();
        scrollToBottom();
        focusInput();
    }
}

/* ====================== INICIALIZAÇÃO ====================== */

applyFontSize();
renderHome();
