function CardItem({ card }) {
    const formattedValue = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
    }).format(card.estimatedValue);

    return (
        <article className="card-item">
            <div className="card-item__top-row">
                <div className="card-item__badges">
                    <span className="tag tag--sport" aria-label={`Sport: ${card.sport}`}>
                        {card.sport}
                    </span>
                    <span className="tag tag--league" aria-label={`League: ${card.league}`}>
                        {card.league}
                    </span>
                </div>

                <span className="card-item__year">{card.year}</span>
            </div>

            <h3>{card.playerName}</h3>
            <p className="card-item__name" title={card.cardName}>
                {card.cardName}
            </p>
            <p className="card-item__team">{card.team}</p>

            {card.notes?.trim() && (
                <p className="card-item__notes" title={card.notes}>
                    {card.notes}
                </p>
            )}

            <div className="card-item__details">
                <span>{card.condition}</span>
                <strong>{formattedValue}</strong>
            </div>
        </article>
    );
}

export default CardItem;