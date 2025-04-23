from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import datetime

nltk.download('vader_lexicon')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///diary.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
sia = SentimentIntensityAnalyzer()

class DiaryEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(20), nullable=False)
    entry = db.Column(db.Text, nullable=False)


with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_entries')
def get_entries():
    entries = DiaryEntry.query.order_by(DiaryEntry.id.desc()).all()
    return jsonify({"entries": [{"date": e.date, "entry": e.entry} for e in entries]})

@app.route('/add_entry', methods=['POST'])
def add_entry():
    entry_text = request.form.get('entry')
    date = datetime.date.today().strftime("%Y-%m-%d")

    new_entry = DiaryEntry(date=date, entry=entry_text)
    db.session.add(new_entry)
    db.session.commit()

    entries = DiaryEntry.query.order_by(DiaryEntry.id.desc()).all()
    return jsonify({"message": "Entry added successfully!", "entries": [{"date": e.date, "entry": e.entry} for e in entries]})

@app.route('/get_sentiment', methods=['GET'])
def get_sentiment():
    entries = DiaryEntry.query.all()
    if not entries:
        return jsonify({"message": "No entries available for sentiment analysis."})

    all_entries = " ".join([entry.entry for entry in entries])
    sentiment_score = sia.polarity_scores(all_entries)

    return jsonify({"sentiment": sentiment_score})

@app.route('/get_sentiment_counts', methods=['GET'])
def get_sentiment_counts():
    entries = DiaryEntry.query.all()
    if not entries:
        return jsonify({"counts": {"happy": 0, "neutral": 0, "sad": 0}})

    happy_count = 0
    neutral_count = 0
    sad_count = 0

    for entry in entries:
        sentiment_score = sia.polarity_scores(entry.entry)
        compound = sentiment_score['compound']
        if compound >= 0.5:
            happy_count += 1
        elif compound > 0:
            happy_count += 1
        elif compound == 0:
            neutral_count += 1
        elif compound > -0.5:
            sad_count += 1
        else:
            sad_count += 1

    return jsonify({"counts": {"happy": happy_count, "neutral": neutral_count, "sad": sad_count}})

@app.route('/clear_entries', methods=['POST'])
def clear_entries():
    db.session.query(DiaryEntry).delete()
    db.session.commit()
    return jsonify({"message": "Diary entries cleared!"})

if __name__ == '__main__':
    app.run(debug=True)