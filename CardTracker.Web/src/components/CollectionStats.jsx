import SummaryCard from "./SummaryCard";

function CollectionStats({ cards, isLoading }) {
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
        <section className="summary-bar" aria-label="Collection summary">
            <SummaryCard
                label="Total Cards"
                value={isLoading ? "—" : cards.length}
            />
            <SummaryCard
                label="Collection Value"
                value={isLoading ? "—" : formattedTotalValue}
            />
            <SummaryCard
                label="Sports Collected"
                value={isLoading ? "—" : sportCount}
            />
        </section>
    );
}

export default CollectionStats;