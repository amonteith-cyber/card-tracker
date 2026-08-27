import { useEffect, useState } from "react";
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
};

const cardsApiUrl = "/api/cards";

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
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardFormValues, setCardFormValues] = useState(emptyCardForm);
  const [cardFormErrors, setCardFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmissionError, setFormSubmissionError] = useState("");
  const [deletingCardId, setDeletingCardId] = useState(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

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
        {deleteErrorMessage && (
          <div className="action-error" role="alert">
            {deleteErrorMessage}
          </div>
        )}
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
              <p>
                {isLoading
                  ? "Loading collection..."
                  : `${cards.length} card${cards.length === 1 ? "" : "s"} in your collection`}
              </p>
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

          {!isLoading && !errorMessage && cards.length > 0 && (
            <div className="card-grid">
              {cards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onEdit={openEditModal}
                  onDelete={handleDeleteCard}
                  isDeleting={deletingCardId === card.id}
                />
              ))}
            </div>
          )}
        </section>
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