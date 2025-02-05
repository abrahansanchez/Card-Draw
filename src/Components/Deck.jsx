import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Deck() {
  const [deckId, setDeckId] = useState(null);
  const [cards, setCards] = useState([]);
  const [remaining, setRemaining] = useState(52);
  const [isShuffling, setIsShuffling] = useState(false);
  const intervalRef = useRef(null);

  // Fetch a new deck when the component loads
  useEffect(() => {
    async function fetchDeck() {
      const res = await axios.get("https://deckofcardsapi.com/api/deck/new/shuffle/");
      setDeckId(res.data.deck_id);
    }
    fetchDeck();
  }, []);

  async function drawCard() {
    if (!deckId) return;

    const res = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);

    if (res.data.remaining === 0) {
      alert("Error: no cards remaining!");
      stopAutoDraw();
      return;
    }

    const card = res.data.cards[0];
    setCards((prevCards) => [...prevCards, card]);
    setRemaining(res.data.remaining);
  }

  function toggleAutoDraw() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      intervalRef.current = setInterval(drawCard, 1000);
    }
  }

  function stopAutoDraw() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function shuffleDeck() {
    if (!deckId) return;

    setIsShuffling(true);
    await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`);

    setCards([]);
    setRemaining(52);
    setIsShuffling(false);
  }

  return (
    <div>
      <h1>🃏 Card Drawing App</h1>
      {deckId ? <p>Deck ID: {deckId}</p> : <p>Loading deck...</p>}
      <p>Cards remaining: {remaining}</p>

      <button onClick={drawCard} disabled={remaining === 0}>Draw Card</button>
      <button onClick={toggleAutoDraw}>
        {intervalRef.current ? "Stop Drawing" : "Start Drawing"}
      </button>
      <button onClick={shuffleDeck} disabled={isShuffling}>
        {isShuffling ? "Shuffling..." : "Shuffle Deck"}
      </button>

      <div>
        {cards.map((card) => (
          <img key={card.code} src={card.image} alt={card.value + " of " + card.suit} />
        ))}
      </div>
    </div>
  );
}

export default Deck;
