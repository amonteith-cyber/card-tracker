function FieldError({ fieldName, error }) {
    if (!error) {
        return null;
    }

    return (
        <p className="form-field__error" id={`${fieldName}-error`}>
            {error}
        </p>
    );
}

function CardForm({
    values,
    errors,
    submissionError,
    onChange,
    onSubmit,
    onCancel,
    submitLabel,
    isSubmitting,
}) {
    function handleInputChange(event) {
        const { name, value } = event.target;

        onChange(
            {
                ...values,
                [name]: value,
            },
            name,
        );
    }

    function getAccessibilityProps(fieldName) {
        const hasError = Boolean(errors[fieldName]);

        return {
            "aria-invalid": hasError || undefined,
            "aria-describedby": hasError ? `${fieldName}-error` : undefined,
        };
    }

    return (
        <form className="card-form" onSubmit={onSubmit} noValidate>
            {submissionError && (
                <div className="form-error-summary" role="alert">
                    {submissionError}
                </div>
            )}

            {Object.keys(errors).length > 0 && (
                <div className="form-error-summary" role="alert">
                    Please correct the highlighted fields before saving.
                </div>
            )}

            <div className="form-grid">
                <label className="form-field">
                    <span>Sport</span>
                    <input
                        name="sport"
                        type="text"
                        value={values.sport}
                        onChange={handleInputChange}
                        placeholder="Hockey"
                        autoFocus
                        {...getAccessibilityProps("sport")}
                    />
                    <FieldError fieldName="sport" error={errors.sport} />
                </label>

                <label className="form-field">
                    <span>League</span>
                    <input
                        name="league"
                        type="text"
                        value={values.league}
                        onChange={handleInputChange}
                        placeholder="NHL"
                        {...getAccessibilityProps("league")}
                    />
                    <FieldError fieldName="league" error={errors.league} />
                </label>

                <label className="form-field">
                    <span>Team</span>
                    <input
                        name="team"
                        type="text"
                        value={values.team}
                        onChange={handleInputChange}
                        placeholder="San Jose Sharks"
                        {...getAccessibilityProps("team")}
                    />
                    <FieldError fieldName="team" error={errors.team} />
                </label>

                <label className="form-field">
                    <span>Player name</span>
                    <input
                        name="playerName"
                        type="text"
                        value={values.playerName}
                        onChange={handleInputChange}
                        placeholder="Macklin Celebrini"
                        {...getAccessibilityProps("playerName")}
                    />
                    <FieldError fieldName="playerName" error={errors.playerName} />
                </label>

                <label className="form-field form-field--full">
                    <span>Card name</span>
                    <input
                        name="cardName"
                        type="text"
                        value={values.cardName}
                        onChange={handleInputChange}
                        placeholder="Young Guns Rookie #201"
                        {...getAccessibilityProps("cardName")}
                    />
                    <FieldError fieldName="cardName" error={errors.cardName} />
                </label>

                <label className="form-field">
                    <span>Year</span>
                    <input
                        name="year"
                        type="number"
                        value={values.year}
                        onChange={handleInputChange}
                        min="1800"
                        max="2100"
                        placeholder="2024"
                        {...getAccessibilityProps("year")}
                    />
                    <FieldError fieldName="year" error={errors.year} />
                </label>

                <label className="form-field">
                    <span>Condition</span>
                    <input
                        name="condition"
                        type="text"
                        value={values.condition}
                        onChange={handleInputChange}
                        placeholder="Raw or PSA 10"
                        {...getAccessibilityProps("condition")}
                    />
                    <FieldError fieldName="condition" error={errors.condition} />
                </label>

                <label className="form-field">
                    <span>Estimated value (CAD)</span>
                    <input
                        name="estimatedValue"
                        type="number"
                        value={values.estimatedValue}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="150.00"
                        {...getAccessibilityProps("estimatedValue")}
                    />
                    <FieldError
                        fieldName="estimatedValue"
                        error={errors.estimatedValue}
                    />
                </label>

                <label className="form-field form-field--full">
                    <span>Notes</span>
                    <textarea
                        name="notes"
                        value={values.notes}
                        onChange={handleInputChange}
                        placeholder="Optional details about the card, grading, serial number, or storage."
                        rows="4"
                        {...getAccessibilityProps("notes")}
                    />
                    <FieldError fieldName="notes" error={errors.notes} />
                </label>
            </div>

            <div className="form-actions">
                <button
                    className="secondary-button"
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button className="primary-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}

export default CardForm;