import { useEffect, useMemo, useState } from "react";
import CardItem from "./components/CardItem";
import CardModal from "./components/CardModal";
import CollectionStats from "./components/CollectionStats";
import LoadingSpinner from "./components/LoadingSpinner";
import { validateCardForm } from "./utils/cardValidation";
import "./App.css";


const emptyCardForm = {
  sport: "",
  league: "",
  team: "",
  playerName: "",
  cardName: "",
  year: "",
  condition: "",
  estimatedValue: "",
  notes: "",
  imageUrl: "",
};

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const cardsApiUrl = `${apiBaseUrl}/api/cards`;

function normalizeServerValidationErrors(serverErrors) {
  const normalizedErrors = {};

  if (!serverErrors) {
    return normalizedErrors;
  }

  Object.entries(serverErrors).forEach(([key, messages]) => {
    const lastKeyPart = key.split(".").pop();
    const fieldName =
      lastKeyPart.charAt(0).toLowerCase() + lastKeyPart.slice(1);

    if (
      Object.prototype.hasOwnProperty.call(emptyCardForm, fieldName) &&
      Array.isArray(messages) &&
      messages.length > 0
    ) {
      normalizedErrors[fieldName] = messages[0];
    }
  });

  return normalizedErrors;
}

function getServerErrorMessage(errorBody) {
  return (
    errorBody?.detail ||
    errorBody?.title ||
    "Unable to save the card. Please try again."
  );
}

function buildCardPayload(values) {
  return {
    sport: values.sport.trim(),
    league: values.league.trim(),
    team: values.team.trim(),
    playerName: values.playerName.trim(),
    cardName: values.cardName.trim(),
    year: Number(values.year),
    condition: values.condition.trim(),
    estimatedValue: Number(values.estimatedValue),
    notes: values.notes.trim() || null,
  };
}

function App() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("");
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardFormValues, setCardFormValues] = useState(emptyCardForm);
  const [cardFormErrors, setCardFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmissionError, setFormSubmissionError] = useState("");
  const [deletingCardId, setDeletingCardId] = useState(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);

  async function loadCards() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(cardsApiUrl);

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

  function openAddModal() {
    setEditingCard(null);
    setCardFormValues(emptyCardForm);
    setCardFormErrors({});
    setFormSubmissionError("");
    setIsCardModalOpen(true);
  }

  function openEditModal(card) {
    setEditingCard(card);
    setCardFormValues({
      sport: card.sport ?? "",
      league: card.league ?? "",
      team: card.team ?? "",
      playerName: card.playerName ?? "",
      cardName: card.cardName ?? "",
      year: String(card.year ?? ""),
      condition: card.condition ?? "",
      estimatedValue: String(card.estimatedValue ?? ""),
      notes: card.notes ?? "",
      imageUrl: card.imageUrl ?? "",
    });
    setCardFormErrors({});
    setFormSubmissionError("");
    setIsCardModalOpen(true);
  }

  function closeCardModal() {
    setCardFormErrors({});
    setFormSubmissionError("");
    setEditingCard(null);
    setIsCardModalOpen(false);
  }

  function handleCardFormChange(nextValues, changedField) {
    setCardFormValues(nextValues);
    setFormSubmissionError("");

    setCardFormErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };
      delete updatedErrors[changedField];
      return updatedErrors;
    });
  }

  async function handleCardSubmit(event) {
    event.preventDefault();

    const errors = validateCardForm(cardFormValues);
    setCardFormErrors(errors);
    setFormSubmissionError("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    const cardPayload = {
      ...buildCardPayload(cardFormValues),
      ...(editingCard ? { id: editingCard.id } : {}),
    };
    const requestUrl = editingCard
      ? `${cardsApiUrl}/${editingCard.id}`
      : cardsApiUrl;
    const requestMethod = editingCard ? "PUT" : "POST";

    setIsSubmitting(true);

    try {
      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardPayload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const serverErrors = normalizeServerValidationErrors(errorBody?.errors);

        if (Object.keys(serverErrors).length > 0) {
          setCardFormErrors(serverErrors);
        } else if (response.status === 404 && editingCard) {
          setFormSubmissionError(
            "This card no longer exists. Reload the collection and try again.",
          );
        } else {
          setFormSubmissionError(getServerErrorMessage(errorBody));
        }

        return;
      }

      closeCardModal();
      await loadCards();
    } catch {
      setFormSubmissionError(
        "Unable to reach the API. Confirm that the backend is running and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCard(card) {
    const cardDescription =
      [card.year, card.playerName, card.cardName].filter(Boolean).join(" ") ||
      "this card";

    const userConfirmed = window.confirm(
      `Delete ${cardDescription}?\n\nThis action cannot be undone.`,
    );

    if (!userConfirmed) {
      return;
    }

    setDeleteErrorMessage("");
    setDeletingCardId(card.id);

    try {
      const response = await fetch(`${cardsApiUrl}/${card.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        if (response.status === 404) {
          setDeleteErrorMessage(
            "This card no longer exists. Refresh the collection to see the latest data.",
          );
        } else {
          setDeleteErrorMessage(
            errorBody?.detail ||
            errorBody?.title ||
            "Unable to delete the card. Please try again.",
          );
        }

        return;
      }

      await loadCards();
    } catch {
      setDeleteErrorMessage(
        "Unable to reach the API. Confirm that the backend is running and try again.",
      );
    } finally {
      setDeletingCardId(null);
    }
  }

  useEffect(() => {
    loadCards();
  }, []);

  const filteredCards = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return cards.filter((card) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        card.playerName.toLowerCase().includes(normalizedSearchTerm) ||
        card.team.toLowerCase().includes(normalizedSearchTerm) ||
        card.cardName.toLowerCase().includes(normalizedSearchTerm);

      const matchesSport =
        !selectedSport || card.sport === selectedSport;

      const matchesLeague =
        !selectedLeague || card.league === selectedLeague;

      return matchesSearch && matchesSport && matchesLeague;
    });
  }, [cards, searchTerm, selectedSport, selectedLeague]);

  const sportOptions = useMemo(() => {
    return [...new Set(cards.map((card) => card.sport).filter(Boolean))].sort(
      (firstSport, secondSport) => firstSport.localeCompare(secondSport),
    );
  }, [cards]);

  const leagueOptions = useMemo(() => {
    return [
      ...new Set(
        cards
          .filter((card) => !selectedSport || card.sport === selectedSport)
          .map((card) => card.league)
          .filter(Boolean),
      ),
    ].sort((firstLeague, secondLeague) =>
      firstLeague.localeCompare(secondLeague),
    );
  }, [cards, selectedSport]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedSport || selectedLeague,
  );

  function clearFilters() {
    setSearchTerm("");
    setSelectedSport("");
    setSelectedLeague("");
  }

  function handleSportChange(event) {
    setSelectedSport(event.target.value);
    setSelectedLeague("");
  }

  function openCardDetails(card) {
    setSelectedCard(card);
  }

  function returnToCollection(event) {
    event.preventDefault();
    setSelectedCard(null);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__content">
          <a
            className="brand"
            href="/"
            onClick={selectedCard ? returnToCollection : undefined}
          >
            CardTracker
          </a>

          <div className="header-search">
            <label className="sr-only" htmlFor="card-search">
              Search cards by player name, team name, or card set
            </label>
            <input
              id="card-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search player, team, or card set..."
            />
          </div>
        </div>
      </header>

      <main className="page-content">
        {deleteErrorMessage && (
          <div className="action-error" role="alert">
            {deleteErrorMessage}
          </div>
        )}
        {selectedCard ? (
          <section className="card-detail" aria-labelledby="card-detail-title">
            <p className="eyebrow">COLLECTION CARD</p>

            <h1 id="card-detail-title">
              {selectedCard.playerName || "Unnamed player"}
            </h1>

            <p className="card-detail__name">
              {selectedCard.cardName || "Untitled card"}
            </p>

            <div className="card-detail__tags">
              {selectedCard.sport && (
                <span className="tag tag--sport">{selectedCard.sport}</span>
              )}

              {selectedCard.league && (
                <span className="tag tag--league">{selectedCard.league}</span>
              )}
            </div>

            <dl className="card-detail__facts">
              <div>
                <dt>Year</dt>
                <dd>{selectedCard.year || "Not specified"}</dd>
              </div>

              <div>
                <dt>Team</dt>
                <dd>{selectedCard.team || "Not specified"}</dd>
              </div>

              <div>
                <dt>Condition</dt>
                <dd>{selectedCard.condition || "Not specified"}</dd>
              </div>

              <div>
                <dt>Estimated value</dt>
                <dd>
                  {new Intl.NumberFormat("en-CA", {
                    style: "currency",
                    currency: "CAD",
                  }).format(selectedCard.estimatedValue)}
                </dd>
              </div>
            </dl>

            {selectedCard.notes?.trim() && (
              <section className="card-detail__notes" aria-labelledby="card-notes-title">
                <h2 id="card-notes-title">Notes</h2>
                <p>{selectedCard.notes}</p>
              </section>
            )}

            <p className="card-detail__return-hint">
              Select <strong>CardTracker</strong> in the top-left corner to return to
              your collection.
            </p>
          </section>
        ) : (
          <>
            <section className="page-intro">
              <p className="eyebrow">COLLECTIBLE CARD ORGANIZER</p>
              <h1>My Collection</h1>
              <p className="page-intro__description">
                Organize sports cards by sport, league, team, player, and card
                details.
              </p>
            </section>

            <CollectionStats cards={cards} isLoading={isLoading} />

            <section className="collection-panel" id="collection">
              <div className="collection-panel__heading">
                <div>
                  <h2>Cards</h2>

                  <div className="collection-panel__summary">
                    <p role="status" aria-live="polite">
                      {isLoading
                        ? "Loading collection..."
                        : hasActiveFilters
                          ? `${filteredCards.length} of ${cards.length} card${cards.length === 1 ? "" : "s"} match your filters`
                          : `${cards.length} card${cards.length === 1 ? "" : "s"} in your collection`}
                    </p>

                    {hasActiveFilters && (
                      <button
                        className="filter-clear-button"
                        type="button"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>

                <button
                  className="primary-button"
                  id="add-card"
                  type="button"
                  onClick={openAddModal}
                >
                  Add Card
                </button>
              </div>

              <div className="collection-filters" role="group" aria-label="Filter cards">
                <div className="filter-field">
                  <label htmlFor="sport-filter">Sport</label>
                  <select
                    id="sport-filter"
                    value={selectedSport}
                    onChange={handleSportChange}
                  >
                    <option value="">All sports</option>

                    {sportOptions.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="league-filter">League</label>
                  <select
                    id="league-filter"
                    value={selectedLeague}
                    onChange={(event) => setSelectedLeague(event.target.value)}
                  >
                    <option value="">All leagues</option>

                    {leagueOptions.map((league) => (
                      <option key={league} value={league}>
                        {league}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoading && (
                <LoadingSpinner message="Loading your card collection..." />
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

              {!isLoading &&
                !errorMessage &&
                cards.length > 0 &&
                filteredCards.length === 0 && (
                  <div className="no-results-state">
                    <h3>No matching cards found</h3>
                    <p>
                      Try a different player, team, card set, sport, or league—or clear
                      your filters to view the full collection.
                    </p>
                    <button
                      className="primary-button"
                      type="button"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  </div>
                )}

              {!isLoading && !errorMessage && filteredCards.length > 0 && (
                <div className="card-grid">
                  {filteredCards.map((card) => (
                    <CardItem
                      key={card.id}
                      card={card}
                      onEdit={openEditModal}
                      onDelete={handleDeleteCard}
                      onSelect={openCardDetails}
                      isDeleting={deletingCardId === card.id}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <CardModal
        isOpen={isCardModalOpen}
        onClose={closeCardModal}
        eyebrow={editingCard ? "EDIT COLLECTION CARD" : "COLLECTION CARD"}
        title={editingCard ? "Edit card" : "Add a new card"}
        submitLabel={editingCard ? "Save changes" : "Add Card"}
        formValues={cardFormValues}
        formErrors={cardFormErrors}
        submissionError={formSubmissionError}
        onFormChange={handleCardFormChange}
        onSubmit={handleCardSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default App;