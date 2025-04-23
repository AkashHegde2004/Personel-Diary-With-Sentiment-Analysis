const suggestions = {
    "Very Positive": [
        "Keep up the great work!",
        "You're doing amazing!",
        "Your positivity is inspiring.",
        "Stay awesome!",
        "You're on the right track.",
        "Your happiness is contagious.",
        "Keep shining!",
        "You're making a difference.",
        "Your enthusiasm is wonderful.",
        "Stay positive and keep going!",
        "You're a beacon of joy.",
        "Your optimism is admirable.",
        "Keep spreading happiness.",
        "You're a ray of sunshine.",
        "Your positive energy is infectious.",
        "Stay cheerful and bright.",
        "You're a joy to be around.",
        "Keep that smile going.",
        "Your positivity is a gift.",
        "Stay happy and blessed."
    ],
    "Positive": [
        "Good job!",
        "You're doing well.",
        "Keep it up!",
        "Your efforts are paying off.",
        "Stay positive.",
        "You're on the right path.",
        "Keep moving forward.",
        "Your attitude is great.",
        "Stay optimistic.",
        "You're making progress.",
        "Keep your spirits high.",
        "Your outlook is positive.",
        "Stay encouraged.",
        "You're doing better every day.",
        "Keep your head up.",
        "Your progress is noticeable.",
        "Stay hopeful.",
        "You're improving.",
        "Keep your positive momentum.",
        "Your future looks bright."
    ],
    "Neutral": [
        "Stay balanced.",
        "Keep a steady pace.",
        "Maintain your composure.",
        "Stay calm and collected.",
        "Keep your emotions in check.",
        "Stay level-headed.",
        "Maintain your equilibrium.",
        "Keep a neutral perspective.",
        "Stay centered.",
        "Your balance is commendable.",
        "Keep your cool.",
        "Stay steady.",
        "Maintain your neutrality.",
        "Keep your emotions stable.",
        "Stay even-keeled.",
        "Your composure is admirable.",
        "Keep a neutral outlook.",
        "Stay poised.",
        "Maintain your neutral stance.",
        "Keep your emotions neutral."
    ],
    "Negative": [
        "Stay strong.",
        "You can overcome this.",
        "Keep your head up.",
        "Better days are ahead.",
        "Stay resilient.",
        "You're stronger than you think.",
        "Keep pushing through.",
        "Your struggles are temporary.",
        "Stay hopeful.",
        "You can turn this around.",
        "Keep your spirits up.",
        "Your strength is admirable.",
        "Stay determined.",
        "You can rise above this.",
        "Keep your chin up.",
        "Your perseverance will pay off.",
        "Stay positive despite challenges.",
        "You can find a solution.",
        "Keep your faith strong.",
        "Your tough times will pass."
    ],
    "Very Negative": [
        "Seek support if needed.",
        "You're not alone in this.",
        "Stay strong through this tough time.",
        "Better days will come.",
        "Keep fighting.",
        "Your struggles are valid.",
        "Stay resilient.",
        "You can overcome this.",
        "Keep your hope alive.",
        "Your pain is temporary.",
        "Stay determined to improve.",
        "Your strength is admirable.",
        "Keep pushing through.",
        "You can rise above this.",
        "Stay hopeful despite challenges.",
        "Your perseverance will pay off.",
        "Stay positive despite hardships.",
        "You can find a way out.",
        "Keep your faith strong.",
        "Your tough times will pass."
    ]
  };
  
  function addEntry() {
    const entry = $("#diaryEntry").val();
    if (entry.trim() === "") {
        alert("Please enter some text!");
        return;
    }
    $.post("/add_entry", { entry: entry }, (response) => {
        $("#diaryEntry").val("");
        updateEntryHistory(response.entries);
        showToast("Entry added successfully!");
        updateDashboard();
    }).fail(() => {
        showToast("Error adding entry. Please try again.", "error");
    });
  }
  
  function updateEntryHistory(entries) {
    const entryHistory = $("#entryHistory");
    entryHistory.empty();
  
    entries.forEach((e) => {
        const entryItem = $(
            `<div class="entry-item">
                <div class="entry-date">${e.date}</div>
                <p>${e.entry}</p>
            </div>`
        );
        entryHistory.prepend(entryItem);
        entryItem.hide().fadeIn(500);
    });
  }
  
  function getSentiment() {
    $.get("/get_sentiment", (response) => {
        if (response.sentiment) {
            displaySentimentResult(response.sentiment);
        } else {
            showToast(response.message, "info");
        }
    }).fail(() => {
        showToast("Error analyzing sentiment. Please try again.", "error");
    });
  }
  
  function displaySentimentResult(sentiment) {
    const sentimentWords = getSentimentWords(sentiment.compound);
    const resultHtml =
        `<div class="sentiment-result">
            <h3>Sentiment Analysis</h3>
            <div class="sentiment-bar-container">
                <div class="sentiment-label"><span>Positive</span><span>${(sentiment.pos * 100).toFixed(1)}%</span></div>
                <div class="sentiment-bar" style="width: 0%; background-color: #2ecc71;"></div>
  
                <div class="sentiment-label"><span>Neutral</span><span>${(sentiment.neu * 100).toFixed(1)}%</span></div>
                <div class="sentiment-bar" style="width: 0%; background-color: #3498db;"></div>
  
                <div class="sentiment-label"><span>Negative</span><span>${(sentiment.neg * 100).toFixed(1)}%</span></div>
                <div class="sentiment-bar" style="width: 0%; background-color: #e74c3c;"></div>
            </div>
            <p>Overall sentiment: ${sentiment.compound.toFixed(2)} (${sentimentWords})</p>
        </div>`;
    $("#sentimentResult").html(resultHtml);
  

    setTimeout(() => {
        $(".sentiment-bar").each(function (index) {
            const width = (index === 0 ? sentiment.pos : index === 1 ? sentiment.neu : sentiment.neg) * 100 + "%";
            $(this).animate({ width: width }, 1000);
        });
    }, 100);
  

    const sentimentResultText = `Overall sentiment: ${sentiment.compound.toFixed(2)} (${sentimentWords})`;
    const sentimentUtterance = new SpeechSynthesisUtterance(sentimentResultText);
    window.speechSynthesis.speak(sentimentUtterance);
  
    sentimentUtterance.onend = () => {
        speakSuggestions(sentimentWords);
    };
  }
  
  function getSentimentWords(compound) {
    if (compound >= 0.5) {
        return "Very Positive";
    } else if (compound > 0) {
        return "Positive";
    } else if (compound === 0) {
        return "Neutral";
    } else if (compound > -0.5) {
        return "Negative";
    } else {
        return "Very Negative";
    }
  }
  
  function speakSuggestions(sentimentWords) {
    const sentimentSuggestions = suggestions[sentimentWords];
    if (sentimentSuggestions) {
       
        const selectedSuggestions = sentimentSuggestions.sort(() => 0.5 - Math.random()).slice(0, 5);
        const utterance = new SpeechSynthesisUtterance(selectedSuggestions.join(". "));
        window.speechSynthesis.speak(utterance);
    }
  }
  
  function speakSentiment() {
    const sentimentResult = $("#sentimentResult").text();
    const utterance = new SpeechSynthesisUtterance(sentimentResult);
    window.speechSynthesis.speak(utterance);
  }
  
  function clearEntries() {
    if (confirm("Are you sure you want to clear all entries?")) {
        $.post("/clear_entries", (response) => {
            $("#entryHistory").empty();
            $("#sentimentResult").empty();
            showToast("All entries have been cleared.");
            updateDashboard();
        }).fail(() => {
            showToast("Error clearing entries. Please try again.", "error");
        });
    }
  }
  
  function showToast(message, type = "success") {
    const toast = $(`<div class="toast ${type}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-body">${message}</div>
    </div>`);
    $("body").append(toast);
    toast.toast({ delay: 3000 }).toast("show");
    setTimeout(() => {
        toast.remove();
    }, 3300);
  }
  
  function startVoiceInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    recognition.start();
  
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        $("#diaryEntry").val(transcript);
    };
  
    recognition.onerror = (event) => {
        console.error('Speech recognition error detected: ' + event.error);
    };
  
    recognition.onend = () => {
        console.log('Speech recognition service disconnected');
    };
  }
  
  function updateDashboard() {
    $.get("/get_sentiment_counts", (response) => {
        const counts = response.counts;
        $("#positiveCount").text(counts.happy);
        $("#neutralCount").text(counts.neutral);
        $("#negativeCount").text(counts.sad);
        renderBarChart(counts);
        renderPieChart(counts);
    }).fail(() => {
        showToast("Error fetching dashboard data. Please try again.", "error");
    });
  }
  
  function renderBarChart(counts) {
    const ctx = document.getElementById('sentimentBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Happy', 'Neutral', 'Sad'],
            datasets: [{
                label: 'Entry Counts',
                data: [counts.happy, counts.neutral, counts.sad],
                backgroundColor: ['#2ecc71', '#3498db', '#e74c3c']
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
  }
  
  function renderPieChart(counts) {
    const ctx = document.getElementById('sentimentPieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Happy', 'Neutral', 'Sad'],
            datasets: [{
                label: 'Entry Counts',
                data: [counts.happy, counts.neutral, counts.sad],
                backgroundColor: ['#2ecc71', '#3498db', '#e74c3c']
            }]

        }
    });
  }
  
  $(document).ready(() => {
    $.get("/get_entries", (response) => {
        updateEntryHistory(response.entries);
        updateDashboard();
    });
  });
  