import { useEffect, useRef } from "react";
import CardForm from "./CardForm";

function CardModal({
    isOpen,
    onClose,
    eyebrow,
    title,
    submitLabel,
    formValues,
    formErrors,
    submissionError,
    onFormChange,
    onSubmit,
    isSubmitting,
}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (isOpen && !dialog.open) {
            dialog.showModal();
        }

        if (!isOpen && dialog.open) {
            dialog.close();
        }
    }, [isOpen]);

    function handleBackdropClick(event) {
        if (event.target === dialogRef.current) {
            onClose();
        }
    }

    return (
        <dialog
            className="card-modal"
            ref={dialogRef}
            aria-labelledby="card-modal-title"
            onCancel={onClose}
            onClose={onClose}
            onClick={handleBackdropClick}
        >
            <div className="card-modal__content">
                <div className="card-modal__header">
                    <div>
                        <p className="eyebrow">{eyebrow}</p>
                        <h2 id="card-modal-title">{title}</h2>
                    </div>

                    <button
                        className="icon-button"
                        type="button"
                        onClick={onClose}
                        aria-label="Close card form"
                    >
                        ×
                    </button>
                </div>

                <CardForm
                    values={formValues}
                    errors={formErrors}
                    submissionError={submissionError}
                    onChange={onFormChange}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    submitLabel={submitLabel}
                    isSubmitting={isSubmitting}
                />
            </div>
        </dialog>
    );
}

export default CardModal;