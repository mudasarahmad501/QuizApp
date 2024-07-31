document.addEventListener('DOMContentLoaded', () => {

    const themeToggle = document.getElementById('theme-toggle');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const finishQuizBtn = document.getElementById('finish-quiz-btn');
    const usernameInput = document.getElementById('username');
    const quizList = document.getElementById('quiz-list');
    const resultsSection = document.getElementById('quiz-results');
    const resultsDiv = document.getElementById('results');
    const modal = document.getElementById('quiz-modal');
    const modalContent = document.querySelector('.modal-content');
    const closeModalBtn = document.querySelector('.close');
    const modalQuestionText = document.getElementById('modal-question-text');
    const modalOptionsForm = document.getElementById('modal-options-form');
    const submitAnswerBtn = document.getElementById('submit-answer-btn');

    let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let currentScore = 0;

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    createQuizBtn.addEventListener('click', () => {
        const title = document.getElementById('quiz-title').value;
        const description = document.getElementById('quiz-description').value;
        const subject = document.getElementById('quiz-subject').value;
        const difficulty = document.getElementById('quiz-difficulty').value;

        if (title.trim() === '' || description.trim() === '' || subject.trim() === '' || difficulty.trim() === '') {
            alert('Please fill in all fields to create a quiz.');
            return;
        }

        currentQuiz = {
            title,
            description,
            subject,
            difficulty,
            questions: []
        };

        document.getElementById('create-quiz').style.display = 'none';
        document.getElementById('add-questions').style.display = 'block';
    });

    addQuestionBtn.addEventListener('click', () => {
        const questionText = document.getElementById('question-text').value;
        const options = Array.from(document.getElementsByClassName('option')).map(input => input.value);
        const correctAnswer = document.getElementById('correct-answer').value;

        if (questionText.trim() === '' || correctAnswer.trim() === '' || options.some(option => option.trim() === '')) {
            alert('Please fill in all fields to add a question.');
            return;
        }

        const question = {
            questionText,
            options,
            correctAnswer
        };

        currentQuiz.questions.push(question);
        document.getElementById('question-form').reset();
    });

    finishQuizBtn.addEventListener('click', () => {
        if (!currentQuiz || currentQuiz.questions.length === 0) {
            alert('Please add at least one question to finish the quiz.');
            return;
        }

        quizzes.push(currentQuiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        document.getElementById('add-questions').style.display = 'none';
        document.getElementById('create-quiz').style.display = 'block';
        document.getElementById('quiz-form').reset();

        currentQuiz = null;
        loadQuizList();
    });


    

    function loadQuizList() {
        quizList.innerHTML = '';
        quizzes.forEach((quiz, index) => {
            const quizItem = document.createElement('div');
            quizItem.classList.add('quiz-item');
            quizItem.innerHTML = `
                
                <h3>${quiz.title}</h3>
                <p>${quiz.description}</p>
                <button onclick="startQuiz(${index})">Start Quiz</button>
                <button onclick="deleteQuiz(${index})">Delete Quiz</button>
                <hr>
            `;
            quizList.appendChild(quizItem);
        });
    }

    window.startQuiz = function (index) {
        const user = usernameInput.value;
        if (!user) {
            alert('Please enter a username.');
            return;
        }

        currentQuiz = quizzes[index];
        currentQuestionIndex = 0;
        userAnswers = [];
        currentScore = 0;

        showQuestion();
    };

    window.deleteQuiz = function (index) {
        if (confirm('Are you sure you want to delete this quiz?')) {
            quizzes.splice(index, 1);
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
            loadQuizList();
        }
    };

    function showQuestion() {
        if (currentQuestionIndex < currentQuiz.questions.length) {
            const question = currentQuiz.questions[currentQuestionIndex];
        modalQuestionText.textContent = question.questionText;
        modalOptionsForm.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionLabel = document.createElement('label');
            optionLabel.innerHTML = `
                <input type="radio" name="option" value="${option}"> ${option}
            `;
            modalOptionsForm.appendChild(optionLabel);
            modalOptionsForm.appendChild(document.createElement('br'));
        });

        modal.style.display = 'block';
    }else{
        finishQuiz();
    }

        }
        
    submitAnswerBtn.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) {
            alert('Please select an option.');
            return;
        }

        const userAnswer = selectedOption.value;
        userAnswers.push(userAnswer);

        if (userAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer) {
            currentScore++;
        }

        currentQuestionIndex++;

        

        if (currentQuestionIndex < currentQuiz.questions.length) {
            showQuestion();
            setTimeout(showQuestion, 0);
        } else {
            finishQuiz();
        }

        modal.style.display = 'none';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    function finishQuiz() {
        const user = usernameInput.value;

        const performance = {
            username: user,
            quizTitle: currentQuiz.title,
            score: currentScore,
            correctAnswers: currentQuiz.questions.filter((q, i) => q.correctAnswer === userAnswers[i])
        };

        let performances = JSON.parse(localStorage.getItem('performances')) || [];
        performances.push(performance);
        localStorage.setItem('performances', JSON.stringify(performances));

        resultsDiv.innerHTML = `
            <h3>${user}'s Result</h3>
            <p><strong>Quiz Name:</strong>  ${currentQuiz.title}</p>
            <p><strong>Score:</strong> ${currentScore}/${currentQuiz.questions.length}</p>
            <p><strong>Correct Answers:</strong> ${performance.correctAnswers.map(q => q.questionText).join(', ')}</p>
        `;
        resultsSection.style.display = 'block';
    }

    loadQuizList();
    
});
