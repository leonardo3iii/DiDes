window.STORIES = window.STORIES || [];

const stories = window.STORIES;

let currentStory = null;
let currentStep = 0;

const STORAGE_KEY =
    "digiteEAvanceProgress";

const FONT_SIZE_KEY =
"digiteEAvanceFontSize";
    const TIMER_KEY =
"digiteEAvanceTimer";

let practiceSeconds = 0;

let correctSentences = 0;

let typedWords = 0;

let timerInterval = null;

function normalizeText(text) {

    return text
        .trim()
        .replace(/\./g, "")
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function saveProgress() {
    if (!currentStory) return;

    const historyElement =
        document.getElementById(
            "history"
        );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({

             storyId:
                  currentStory.id,

            currentStep:
                  currentStep,

            correctSentences:
                 correctSentences,

            typedWords:
                 typedWords,

            practiceSeconds:
                 practiceSeconds,

            history:
                  historyElement
                 ? historyElement.innerHTML
                 : ""


        })
    );
}

function loadProgress() {
    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {
        return null;
    }

    return JSON.parse(saved);
}

function getFontSize() {

    return parseInt(

        localStorage.getItem(
            FONT_SIZE_KEY
        )

    ) || 18;
}

function applyFontSize() {

    const size =
    getFontSize();

    document.body.style.fontSize =
    size + "px";

    document.documentElement.style.fontSize =
    size + "px";

    document.querySelectorAll(
    ".story-text"
    ).forEach(el => {

    el.style.fontSize =
        (size * 1.35) + "px";
    });

    document.querySelectorAll(
    ".story-card h3"
    ).forEach(el => {

    el.style.fontSize =
        (size * 1.25) + "px";
    });

    document.querySelectorAll(
    ".title h1"
    ).forEach(el => {

    el.style.fontSize =
        (size * 1.6) + "px";
    });
}

function increaseFont() {

    let size =
        getFontSize();

    if(size < 36){

        size += 2;
    }

    localStorage.setItem(
        FONT_SIZE_KEY,
        size
    );

    applyFontSize();
}

function decreaseFont() {

    let size =
        getFontSize();

    if(size > 12){

        size -= 2;
    }

    localStorage.setItem(
        FONT_SIZE_KEY,
        size
    );

    applyFontSize();
}
function saveTimer() {

    if(!currentStory) return;

    localStorage.setItem(

        TIMER_KEY + "_" + currentStory.id,

        practiceSeconds

    );
}

function loadTimer() {

    if(!currentStory){

        return 0;
    }

    return parseInt(

        localStorage.getItem(

            TIMER_KEY + "_" + currentStory.id

        )

    ) || 0;
}

function formatPracticeTime(seconds){

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const secs =
        seconds % 60;

    let result = "";

    if(hours > 0){

        result +=
            hours +
            (hours === 1
                ? " hora"
                : " horas");
    }

    if(minutes > 0){

        if(result){

            result += ", ";
        }

        result +=
            minutes +
            (minutes === 1
                ? " minuto"
                : " minutos");
    }

    if(secs > 0){

        if(result){

            result += " e ";
        }

        result +=
            secs +
            (secs === 1
                ? " segundo"
                : " segundos");
    }

    return result;
}

function formatTime(seconds){

    const hours =
        Math.floor(seconds / 3600);

    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );

    const secs =
        seconds % 60;

    return (
        String(hours).padStart(2,"0")
        + ":"
        + String(minutes).padStart(2,"0")
        + ":"
        + String(secs).padStart(2,"0")
    );
}

function startTimer(){

    if(timerInterval){

        clearInterval(
            timerInterval
        );
    }

    timerInterval =

        setInterval(() => {

            practiceSeconds++;

            saveTimer();

            const display =

                document.getElementById(
                    "timerDisplay"
                );

            if(display){

                display.textContent =

                    formatTime(
                        practiceSeconds
                    );
            }

        },1000);
}

function stopTimer(){

    if(timerInterval){

        clearInterval(
            timerInterval
        );
    }
}
function scrollToBottom() {
    setTimeout(() => {

        window.scrollTo({
            top:
                document.body.scrollHeight,

            behavior:
                "smooth"
        });

    }, 50);
}

function focusInput() {

    const input =
        document.getElementById(
            "answer"
        );

    if (input) {
        input.focus();
    }
}

function getPrompt() {

    const title =
        currentStory.title
            .replace("🏨", "")
            .replace("👻", "")
            .trim();

    return `PS C:\\Historias\\${title}>`;
}

function renderHome() {

    document.getElementById(
        "homeScreen"
    ).style.display = "block";

    stopTimer();

    document.getElementById(
        "gameScreen"
    ).style.display = "none";

    const progress =
        loadProgress();

let html = `

<div class="font-controls">

<span
class="font-button"
onclick="decreaseFont()"
>

A-

</span>

<span
class="font-button"
onclick="increaseFont()"
>

A+

</span>

</div>

<div class="title">

<h1>PS C:\\Historias></h1>

<p>Selecione uma história</p>

</div>
`;

    stories.forEach(story => {

        let continueText = "";

        if (
            progress &&
            progress.storyId === story.id
        ) {

            continueText = `
<p>
Continuar da etapa
${progress.currentStep + 1}
</p>
`;
        }

        html += `
<div
class="story-card"
onclick="openStory('${story.id}')"
>

<h3>
${story.title}
</h3>

<p>
${story.description}
</p>

${continueText}

</div>
`;
    });

    document.getElementById(
        "homeScreen"
    ).innerHTML = html;
}

function openStory(storyId) {

    currentStory =

        stories.find(
            story =>
                story.id === storyId
        );

    practiceSeconds =
        loadTimer();

       const progress =
        loadProgress();

         if(progress){

             correctSentences =
                 progress.correctSentences || 0;

             typedWords =
                 progress.typedWords || 0;

             practiceSeconds =
                 progress.practiceSeconds || 0;
         }

         if (
         progress &&
         progress.storyId === storyId
         ) {

         currentStep =
            progress.currentStep;

        } else {

         currentStep = 0;
        }

         document.getElementById(
         "homeScreen"
         ).style.display = "none";

         document.getElementById(
         "gameScreen"
         ).style.display = "block";

         document.getElementById(
         "gameScreen"
         ).innerHTML = `

         <div class="font-controls">

             <span
             class="font-button"
             onclick="decreaseFont()"
             >

             A-

             </span>

             <span
             class="font-button"
             onclick="increaseFont()"
             >

             A+

             </span>

             <div
             class="timer-label"
             >

             Tempo

             </div>

             <div
             id="timerDisplay"
             class="timer-display"
             >

             ${formatTime(
             practiceSeconds
             )}

             </div>

             </div>

             <div
             class="history"
             id="history"
              >
             </div>

             <div
              class="answer-line"
              >

              <span class="prompt">
              ${getPrompt()}
              </span>

              <input
              id="answer"
              autocomplete="off"
              spellcheck="false"
              >

             </div>

             <div class="command-bar">

             <div
             class="command"
             onclick="renderHome()"
             >
             ← voltar para catálogo
             </div>

             <div
              class="command"
              onclick="checkAnswer()"
              >
              enter = validar
             </div>

             </div>
            `;

    const historyElement =
        document.getElementById(
            "history"
        );

    if (
        progress &&
        progress.storyId === storyId &&
        progress.history
    ) {

        historyElement.innerHTML =
            progress.history;

    } else {

        renderCurrentStep();
    }

    const input =
        document.getElementById(
            "answer"
        );

    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                checkAnswer();
            }
        }
    );

    input.addEventListener(
        "paste",
        function(event) {

            event.preventDefault();
        }
    );

    scrollToBottom();

    focusInput();

    startTimer();
}

function renderCurrentStep() {

    const history =
        document.getElementById(
            "history"
        );

    const step =
        currentStory.steps[
            currentStep
        ];

    history.innerHTML += `
<div class="story-block">

<div class="step-number">
[${String(
currentStep + 1
).padStart(3,"0")}/${String(
currentStory.steps.length
).padStart(3,"0")}]
</div>

<div class="story-text">
${step.portugueseText}
</div>

<div class="choice">
<span class="choice-label">
Curta:
</span>
${step.easy}
</div>

<div class="choice">
<span class="choice-label">
Média:
</span>
${step.medium}
</div>

<div class="choice">
<span class="choice-label">
Longa:
</span>
${step.advanced}
</div>

<div class="choice">
<span class="choice-label">
Especialista:
</span>
${step.expert}
</div>

</div>
`;

    saveProgress();

    scrollToBottom();
    focusInput();
}

function checkAnswer() {

    const step =
        currentStory.steps[
            currentStep
        ];

    const answer =
        document
        .getElementById(
            "answer"
        )
        .value
        .trim();

    const history =
        document.getElementById(
            "history"
        );

    const normalizedAnswer =
        normalizeText(answer);

    const correct =

        normalizedAnswer ===
        normalizeText(step.easy)

        ||

        normalizedAnswer ===
        normalizeText(step.medium)

        ||

        normalizedAnswer ===
        normalizeText(step.advanced)

        ||

        normalizedAnswer ===
        normalizeText(step.expert);

         if (correct) {

                 history.innerHTML += `
                 <div class="success">
                 ${getPrompt()} ${answer}
                 ✓ Correto
                 </div>
                 `;

                correctSentences++;

                typedWords +=
                    answer
                        .trim()
                        .split(/\s+/)
                        .length;

                 currentStep++;

                 saveProgress();

                 document
                     .getElementById(
                         "answer"
                     )
                     .value = "";

        if (
                     currentStep <
                     currentStory.steps.length
                     ) {

                     renderCurrentStep();

        } else {

            history.innerHTML += `

            <div class="success">

            🏆 HISTÓRIA CONCLUÍDA

            <br><br>

            ✅ ${correctSentences}
            frases corretas

            <br><br>

            📝 ${typedWords}
            palavras digitadas

            <br><br>

            ⏱ ${formatPracticeTime(
              practiceSeconds
            )}
            de prática

            </div>

            `;

            scrollToBottom();
        }

    } else {

        history.innerHTML += `
<div class="error">
${getPrompt()} ${answer}
✗ Frase incorreta
</div>
`;

        saveProgress();

        document
            .getElementById(
                "answer"
            )
            .value = "";
    }

    scrollToBottom();
    focusInput();
}

applyFontSize()

renderHome();