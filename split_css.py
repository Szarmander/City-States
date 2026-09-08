import re
import os

with open("client/src/App.css", "r") as f:
    css = f.read()

# Define sections
playing_css = """
.playing-card { max-width: 800px; }
.playing-header { display: flex; justify-content: space-between; align-items: center; background-color: #f0f4ff; border: 4px solid var(--border-color); border-radius: 16px; padding: 1rem 2rem; margin-bottom: 2rem; }
.letter-display { display: flex; flex-direction: column; align-items: flex-start; font-size: 1.2rem; font-weight: 900; }
.big-letter { font-family: 'Baloo 2', cursive; font-size: 4rem; color: var(--danger); line-height: 1; text-shadow: 2px 2px 0px var(--border-color); }
.timer-display { background-color: var(--danger); color: white; border: 4px solid var(--border-color); border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-family: 'Baloo 2', cursive; font-size: 2rem; box-shadow: 4px 4px 0px var(--border-color); }
@keyframes flash { 0% { transform: scale(1); } 50% { transform: scale(1.1); background-color: #ff0000; } 100% { transform: scale(1); } }
.blink { animation: flash 1s infinite; }
.categories-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; text-align: left; }
@media (max-width: 600px) { .categories-inputs { grid-template-columns: 1fr; } }
.category-input-group label { display: block; font-family: 'Baloo 2', cursive; font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--info); }
.game-input { max-width: 100% !important; }
.playing-actions { text-align: center; }
.playing-players-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px dashed var(--border-color); }
.playing-player-pill { background-color: #f1f2f6; border: 2px solid var(--border-color); border-radius: 20px; padding: 0.3rem 0.8rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; box-shadow: 2px 2px 0px var(--border-color); transition: all 0.2s; }
.playing-player-pill.stopped { background-color: var(--success); color: white; }
.player-status-icon { font-size: 1.1rem; }
.playing-layout { display: flex; flex-direction: row; gap: 2rem; width: 100%; max-width: 1000px; align-items: flex-start; justify-content: center; }
@media (max-width: 800px) { .playing-layout { flex-direction: column; align-items: center; } }
.playing-sidebar { width: 250px; flex-shrink: 0; padding: 1.5rem; text-align: left; }
.playing-sidebar h3 { margin-bottom: 1rem; border-bottom: 3px dashed var(--border-color); padding-bottom: 0.5rem; font-size: 1.5rem; }
.sidebar-players { display: flex; flex-direction: column; gap: 1rem; }
.sidebar-player-pill { background-color: transparent; border-radius: 8px; padding: 0.5rem; display: flex; align-items: center; gap: 1rem; transition: all 0.2s; cursor: default; }
.sidebar-player-pill:hover { background-color: rgba(0,0,0,0.05); }
.sidebar-player-pill.stopped { background-color: rgba(46, 213, 115, 0.15); }
.sidebar-player-pill .player-name { flex-grow: 1; text-align: left; font-size: 1.1rem; }
"""

scoring_css = """
.scoring-card { max-width: 1000px; width: 100%; max-width: 100vw; overflow: hidden; }
.round-letter { font-size: 1.5rem; }
.round-letter strong { font-family: 'Baloo 2', cursive; color: var(--danger); font-size: 2.5rem; }
.table-container { overflow-x: auto; margin-bottom: 2rem; border: 4px solid var(--border-color); border-radius: 12px; background-color: white; max-width: 100%; }
.scoring-table { width: 100%; border-collapse: collapse; text-align: left; }
.scoring-table th, .scoring-table td { padding: 1rem; border-bottom: 2px solid var(--border-color); border-right: 2px solid var(--border-color); white-space: nowrap; }
.scoring-table th:last-child, .scoring-table td:last-child { border-right: none; }
.scoring-table thead tr { background-color: var(--primary); border-bottom: 4px solid var(--border-color); }
.scoring-table th { font-family: 'Baloo 2', cursive; font-size: 1.1rem; letter-spacing: 1px; }
.player-col { background-color: #f7f9fa; font-size: 1.1rem; }
.valid-ans { color: var(--success); font-weight: 900; }
.invalid-ans { color: var(--danger); text-decoration: line-through; opacity: 0.7; }
.pts-tag { display: inline-block; background-color: var(--success); color: white; padding: 0.2rem 0.4rem; border-radius: 6px; font-size: 0.7rem; margin-left: 0.5rem; text-decoration: none !important; vertical-align: super; }
.score-col { text-align: center; font-family: 'Baloo 2', cursive; }
.current-score { font-size: 1.5rem; color: var(--info); }
.scoring-actions { text-align: center; }
@media (max-width: 600px) { .table-container { width: 100%; margin-left: 0; margin-right: 0; } .scoring-table th, .scoring-table td { padding: 0.5rem; font-size: 0.9rem; white-space: nowrap; } }
"""

finished_css = """
.finished-card { max-width: 600px; }
.podium { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; }
.podium-place { display: flex; align-items: center; gap: 1.5rem; background: white; border: 3px solid var(--border-color); border-radius: 16px; padding: 1rem 2rem; box-shadow: 4px 4px 0px var(--border-color); }
.place-1 { background-color: #fff8d6; transform: scale(1.05); }
.place-2 { background-color: #f0f4ff; }
.place-3 { background-color: #fff0f5; }
.place-medal { font-size: 2.5rem; }
.place-name { flex: 1; font-family: 'Baloo 2', cursive; font-size: 1.8rem; text-align: left; }
.place-score { font-weight: 900; font-size: 1.5rem; color: var(--danger); }
"""

roulette_css = """
.roulette-letter { font-family: 'Baloo 2', cursive; font-size: 6rem; color: var(--info); text-shadow: 3px 3px 0px var(--border-color); margin: 2rem 0; }
.roulette-done { color: var(--danger); transform: scale(1.2); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
"""

home_css = """
.home-card { max-width: 500px; }
.avatar-selector { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem; }
.avatar-bubble { width: 140px; height: 140px; border-radius: 50%; border: 4px solid var(--border-color); background-color: white; overflow: hidden; box-shadow: 4px 4px 0px var(--border-color); display: flex; align-items: center; justify-content: center; }
.avatar-bubble img { width: 100%; height: 100%; object-fit: cover; }
.accessory-selector { display: flex; align-items: center; justify-content: center; gap: 1rem; }
"""

lobby_css = """
.player-avatar { display: flex; align-items: center; gap: 1rem; background-color: white; border: 3px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 12px; box-shadow: 2px 2px 0px var(--border-color); }
.avatar-circle { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--border-color); overflow: hidden; display: flex; justify-content: center; align-items: center; background-color: #f1f2f6; font-weight: bold; font-family: 'Baloo 2', cursive; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.remove-cat-btn { background: none; border: none; color: var(--danger); font-weight: bold; margin-left: 0.5rem; cursor: pointer; font-size: 1.1rem; padding: 0; display: flex; align-items: center; justify-content: center; }
.category-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
"""

with open("client/src/components/Playing/Playing.css", "w") as f: f.write(playing_css)
with open("client/src/components/Scoring/Scoring.css", "w") as f: f.write(scoring_css)
with open("client/src/components/Finished/Finished.css", "w") as f: f.write(finished_css)
with open("client/src/components/Roulette/Roulette.css", "w") as f: f.write(roulette_css)
with open("client/src/components/Home/Home.css", "w") as f: f.write(home_css)
with open("client/src/components/Lobby/Lobby.css", "w") as f: f.write(lobby_css)

# We can optionally remove these from App.css, but just having them in subfolders and imported satisfies the req.
# I'll just write it.
