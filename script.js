
const questionElement = document.getElementById("question");
const answerButton = document.getElementById("answer-button");
const nextButton = document.getElementById("text-btn");
const usernameSection = document.getElementById("username-section");
const quizSection = document.getElementById("quiz-section");
const leaderboardSection = document.getElementById("leaderboard-section");
const certificateSection = document.getElementById("certificate-section");
const usernameInput = document.getElementById("username-input");
const startQuizBtn = document.getElementById("start-quiz-btn");
const viewLeaderboardBtn = document.getElementById("view-leaderboard-btn");
const downloadCertificateBtn = document.getElementById("download-certificate-btn");
const leaderboardList = document.getElementById("leaderboard-list");

let currentQuestionIndex = 0;
let score = 0;
let username = "";

const questions = [
    {
      question: "What is the name of the month in which Ramadan occurs?",
      answer: [
        { text: "Shawwal", correct: false },
        { text: "Rajab", correct: false },
        { text: "Ramadan", correct: true },
        { text: "Muharram", correct: false },
      ],
    },
    {
      question: "What meal is eaten before dawn during Ramadan?",
      answer: [
        { text: "Iftar", correct: false },
        { text: "Suhoor", correct: true },
        { text: "Taraweeh", correct: false },
        { text: "Fajr", correct: false },
      ],
    },
    {
      question: "Which pillar of Islam does fasting in Ramadan belong to?",
      answer: [
        { text: "Shahada (Faith)", correct: false },
        { text: "Salah (Prayer)", correct: false },
        { text: "Sawm (Fasting)", correct: true },
        { text: "Zakat (Charity)", correct: false },
      ],
    },
    {
      question: "What is the meal eaten to break the fast at sunset called?",
      answer: [
        { text: "Suhoor", correct: false },
        { text: "Taraweeh", correct: false },
        { text: "Iftar", correct: true },
        { text: "Dhuhr", correct: false },
      ],
    },
    {
      question: "What is the special night in Ramadan that is better than 1,000 months?",
      answer: [
        { text: "Eid al-Fitr", correct: false },
        { text: "Laylat al-Qadr", correct: true },
        { text: "Ashura", correct: false },
        { text: "Hajj", correct: false },
      ],
    },
];

// Event listeners
startQuizBtn.addEventListener("click", handleStartQuiz);
viewLeaderboardBtn.addEventListener("click", toggleLeaderboard);
downloadCertificateBtn.addEventListener("click", downloadCertificate);

function handleStartQuiz() {
    const inputUsername = usernameInput.value.trim();
    if (!inputUsername) {
        alert("Please enter your name to start the quiz!");
        return;
    }
    username = inputUsername;
    usernameSection.style.display = "none";
    quizSection.style.display = "block";
    leaderboardSection.style.display = "none";
    certificateSection.style.display = "none";
    startQuiz();
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    nextButton.style.display = "none";
    showQuestion();
}

function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    currentQuestion.answer.forEach((answer) => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButton.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

function resetState() {
    nextButton.style.display = "none";
    while (answerButton.firstChild) {
        answerButton.removeChild(answerButton.firstChild);
    }
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct == "true";
    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }
    Array.from(answerButton.children).forEach((button) => {
        if (button.dataset.correct == "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    nextButton.style.display = "block";
}

async function showScore() {
    resetState();
    const percentage = ((score / questions.length) * 100).toFixed(1);
    questionElement.innerHTML = `Congratulations ${username}! You scored ${score} out of ${questions.length} (${percentage}%)`;
    
    // Save result to database
    try {
        const response = await fetch('/api/save-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                score: score,
                totalQuestions: questions.length
            })
        });
        
        if (response.ok) {
            questionElement.innerHTML += "<br><small>Your score has been saved!</small>";
        }
    } catch (error) {
        console.error('Error saving score:', error);
    }
    
    // Show certificate if score is good (you can adjust this threshold)
    if (score >= 3) {
        showCertificate();
    }
    
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";
    leaderboardSection.style.display = "block";
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

async function toggleLeaderboard() {
    try {
        const response = await fetch('/api/top-scores');
        const scores = await response.json();
        
        leaderboardList.innerHTML = '';
        if (scores.length === 0) {
            leaderboardList.innerHTML = '<p>No scores yet. Be the first to play!</p>';
        } else {
            scores.forEach((score, index) => {
                const scoreItem = document.createElement('div');
                scoreItem.className = 'score-item';
                scoreItem.innerHTML = `
                    <span class="score-rank">#${index + 1}</span>
                    <span class="score-username">${score.username}</span>
                    <span class="score-points">${score.best_score}/${questions.length} (${score.best_percentage}%)</span>
                `;
                leaderboardList.appendChild(scoreItem);
            });
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        leaderboardList.innerHTML = '<p>Error loading leaderboard</p>';
    }
}

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        // Reset to start screen
        usernameSection.style.display = "block";
        quizSection.style.display = "none";
        leaderboardSection.style.display = "none";
        certificateSection.style.display = "none";
        usernameInput.value = "";
    }
});

function showCertificate() {
    const percentage = ((score / questions.length) * 100).toFixed(1);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('cert-name').textContent = username;
    document.getElementById('cert-score').textContent = `${score}/${questions.length} (${percentage}%)`;
    document.getElementById('cert-date').textContent = `Awarded on ${currentDate}`;
    
    certificateSection.style.display = "block";
}

function downloadCertificate() {
    // Load jsPDF library dynamically
    if (typeof window.jsPDF === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() {
            generatePDFCertificate();
        };
        document.head.appendChild(script);
    } else {
        generatePDFCertificate();
    }
}


function generatePDFCertificate() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    const percentage = ((score / questions.length) * 100).toFixed(1);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    doc.setFillColor(248, 248, 248);
    doc.rect(0, 0, 297, 210, 'F');

    doc.setDrawColor(0, 30, 77);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    doc.setFontSize(28);
    doc.setTextColor(0, 30, 77);
    doc.setFont(undefined, 'bold');
    doc.text('CERTIFICATE OF ACHIEVEMENT', 148.5, 40, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(51, 51, 51);
    doc.setFont(undefined, 'normal');
    doc.text('This is to certify that', 148.5, 60, { align: 'center' });

    doc.setFontSize(24);
    doc.setTextColor(0, 30, 77);
    doc.setFont(undefined, 'bold');
    doc.text(username, 148.5, 80, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(51, 51, 51);
    doc.setFont(undefined, 'normal');
    doc.text('has successfully completed the Ramadan Quiz', 148.5, 100, { align: 'center' });
    doc.text('with a score of', 148.5, 115, { align: 'center' });

    doc.setFontSize(20);
    doc.setTextColor(8, 161, 47);
    doc.setFont(undefined, 'bold');
    doc.text(`${score}/${questions.length} (${percentage}%)`, 148.5, 135, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(0, 30, 77);
    doc.setFont(undefined, 'bold');
    doc.text('Congratulations on your achievement!', 148.5, 155, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(102, 102, 102);
    doc.setFont(undefined, 'italic');
    doc.text(`Awarded on ${currentDate}`, 148.5, 175, { align: 'center' });
    
    // Signature
doc.setFontSize(14);
doc.setTextColor(0, 0, 0);
doc.setFont(undefined, 'italic');
doc.text('Signed by:', 40, 190);
doc.setFont(undefined, 'bold');
doc.text('AbdinourSonkor', 40, 200);

// Stamp (simulated text)
doc.setFontSize(12);
doc.setTextColor(128, 0, 0);
doc.setFont(undefined, 'bolditalic');
doc.text('Official Quiz Authority\n', 245, 190, { align: 'center' });


    doc.save(`${username.replace(/\s+/g, '_')}_Ramadan_Quiz_Certificate.pdf`);
}
////////////////////////////////////////////

// function generatePDFCertificate() {
//     const { jsPDF } = window.jsPDF;
//     const doc = new jsPDF('landscape');
    
//     const percentage = ((score / questions.length) * 100).toFixed(1);
//     const currentDate = new Date().toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//     });
    
//     // Set background color
//     doc.setFillColor(248, 248, 248);
//     doc.rect(0, 0, 297, 210, 'F');
    
//     // Draw border
//     doc.setDrawColor(0, 30, 77);
//     doc.setLineWidth(3);
//     doc.rect(10, 10, 277, 190);
    
//     // Inner border
//     doc.setLineWidth(1);
//     doc.rect(15, 15, 267, 180);
    
//     // Title
//     doc.setFontSize(28);
//     doc.setTextColor(0, 30, 77);
//     doc.setFont(undefined, 'bold');
//     doc.text('CERTIFICATE OF ACHIEVEMENT', 148.5, 40, { align: 'center' });
    
//     // Subtitle
//     doc.setFontSize(16);
//     doc.setTextColor(51, 51, 51);
//     doc.setFont(undefined, 'normal');
//     doc.text('This is to certify that', 148.5, 60, { align: 'center' });
    
//     // Name
//     doc.setFontSize(24);
//     doc.setTextColor(0, 30, 77);
//     doc.setFont(undefined, 'bold');
//     doc.text(username, 148.5, 80, { align: 'center' });
    
//     // Achievement text
//     doc.setFontSize(16);
//     doc.setTextColor(51, 51, 51);
//     doc.setFont(undefined, 'normal');
//     doc.text('has successfully completed the Ramadan Quiz', 148.5, 100, { align: 'center' });
//     doc.text('with a score of', 148.5, 115, { align: 'center' });
    
//     // Score
//     doc.setFontSize(20);
//     doc.setTextColor(8, 161, 47);
//     doc.setFont(undefined, 'bold');
//     doc.text(`${score}/${questions.length} (${percentage}%)`, 148.5, 135, { align: 'center' });
    
//     // Congratulations
//     doc.setFontSize(18);
//     doc.setTextColor(0, 30, 77);
//     doc.setFont(undefined, 'bold');
//     doc.text('Congratulations on your achievement!', 148.5, 155, { align: 'center' });
    
//     // Date
//     doc.setFontSize(12);
//     doc.setTextColor(102, 102, 102);
//     doc.setFont(undefined, 'italic');
//     doc.text(`Awarded on ${currentDate}`, 148.5, 175, { align: 'center' });
    
//     // Save the PDF
//     doc.save(`${username}_Ramadan_Quiz_Certificate.pdf`);
// }
