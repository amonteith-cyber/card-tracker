import { useEffect, useState } from "react";
import "./App.css";

function SummaryCard({ label, value }) {
  return (
    <article className="summary-card">
      <p className="summary-card__label">{label}</p>
      <p className="summary-card__value">{value}</p>
    </article>
  );
}

function CardItem({ card }) {
  const formattedValue = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(card.estimatedValue);

  return (
    <article className="card-item">
      <div className="card-item__top-row">
        <span className="tag">
          {card.sport} · {card.league}
        </span>
        <span className="card-item__year">{card.year}</span>
      </div>

      <h3>{card.playerName}</h3>
      <p className="card-item__name">{card.cardName}</p>
      <p className="card-item__team">{card.team}</p>

      <div className="card-item__details">
        <span>{card.condition}</span>
        <strong>{formattedValue}</strong>
      </div>
    </article>
  );
}

function App() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadCards() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/cards");

      if (!response.ok) {
        throw new Error(`The API returned status ${response.status}.`);
      }

      const data = await response.json();
      setCards(data);
    } catch (error) {
      setErrorMessage(
        "Unable to load your cards. Confirm that the API is running and try again.",
      );
      console.error("Failed to load cards:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCards();
  }, []);

  const totalValue = cards.reduce(
    (sum, card) => sum + Number(card.estimatedValue),
    0,
  );

  const sportCount = new Set(cards.map((card) => card.sport)).size;

  const formattedTotalValue = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(totalValue);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__content">
          <a className="brand" href="/">
            CardTracker
          </a>

          <nav className="site-nav" aria-label="Main navigation">
            <a href="#collection">My Collection</a>
            <a href="#add-card">Add Card</a>
          </nav>
        </div>
      </header>

      <main className="page-content">
        <section className="page-intro">
          <p className="eyebrow">COLLECTIBLE CARD ORGANIZER</p>
          <h1>My Collection</h1>
          <p className="page-intro__description">
            Organize sports cards by sport, league, team, player, and card
            details.
          </p>
        </section>

        <section className="summary-grid" aria-label="Collection summary">
          <SummaryCard label="Total Cards" value={cards.length} />
          <SummaryCard label="Collection Value" value={formattedTotalValue} />
          <SummaryCard label="Sports Collected" value={sportCount} />
        </section>

        <section className="collection-panel" id="collection">
          <div className="collection-panel__heading">
            <div>
              <h2>Cards</h2>
              <p>
                {isLoading
                  ? "Loading collection..."
                  : `${cards.length} card${cards.length === 1 ? "" : "s"} in your collection`}
              </p>
            </div>

            <button className="primary-button" id="add-card" type="button">
              Add Card
            </button>
          </div>

          {isLoading && (
            <div className="empty-state">
              <h3>Loading your card collection</h3>
              <p>Please wait while CardTracker retrieves your cards.</p>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="error-state" role="alert">
              <h3>Cards could not be loaded</h3>
              <p>{errorMessage}</p>
              <button className="secondary-button" type="button" onClick={loadCards}>
                Retry
              </button>
            </div>
          )}

          {!isLoading && !errorMessage && cards.length === 0 && (
            <div className="empty-state">
              <h3>Your collection is empty</h3>
              <p>
                Add your first card to begin organizing your sports-card
                collection.
              </p>
            </div>
          )}

          {!isLoading && !errorMessage && cards.length > 0 && (
            <div className="card-grid">
              {cards.map((card) => (
                <CardItem key={card.id} card={card} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;