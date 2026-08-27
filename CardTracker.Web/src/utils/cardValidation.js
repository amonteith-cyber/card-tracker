export function validateCardForm(values) {
    const errors = {};

    const requiredTextFields = [
        ["sport", "Sport", 50],
        ["league", "League", 50],
        ["team", "Team", 100],
        ["playerName", "Player name", 100],
        ["cardName", "Card name", 150],
        ["condition", "Condition", 50],
    ];

    requiredTextFields.forEach(([fieldName, label, maxLength]) => {
        const value = values[fieldName].trim();

        if (!value) {
            errors[fieldName] = `${label} is required.`;
        } else if (value.length > maxLength) {
            errors[fieldName] = `${label} cannot exceed ${maxLength} characters.`;
        }
    });

    const year = Number(values.year);

    if (!values.year.trim()) {
        errors.year = "Year is required.";
    } else if (!Number.isInteger(year) || year < 1800 || year > 2100) {
        errors.year = "Year must be a whole number between 1800 and 2100.";
    }

    const estimatedValue = Number(values.estimatedValue);

    if (!values.estimatedValue.trim()) {
        errors.estimatedValue = "Estimated value is required.";
    } else if (
        !Number.isFinite(estimatedValue) ||
        estimatedValue < 0 ||
        estimatedValue > 1_000_000
    ) {
        errors.estimatedValue =
            "Estimated value must be between 0 and 1,000,000.";
    }

    if (values.notes.length > 1000) {
        errors.notes = "Notes cannot exceed 1000 characters.";
    }

    return errors;
}