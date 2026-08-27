function SummaryCard({ label, value }) {
    return (
        <article className="summary-card">
            <p className="summary-card__label">{label}</p>
            <p className="summary-card__value">{value}</p>
        </article>
    );
}

export default SummaryCard;