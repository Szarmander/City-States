#!/bin/bash
cd client/src/components

mkdir -p Home Lobby Playing Scoring Finished Roulette AudioPlayer Room

mv Home.tsx Home/
mv Lobby.tsx Lobby/
mv Playing.tsx Playing/
mv Scoring.tsx Scoring/
mv Finished.tsx Finished/
mv Roulette.tsx Roulette/
mv AudioPlayer.tsx AudioPlayer/
mv Room.tsx Room/

# Touch css files
touch Home/Home.css Lobby/Lobby.css Playing/Playing.css Scoring/Scoring.css Finished/Finished.css Roulette/Roulette.css Room/Room.css

# Add imports to top of TSX files
for c in Home Lobby Playing Scoring Finished Roulette Room; do
  sed -i '' "1s/^/import '.\/${c}.css';\n/" ${c}/${c}.tsx
done

