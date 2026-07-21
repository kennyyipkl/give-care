interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const icon =
    variant === "danger"
      ? "🗑️"
      : variant === "warning"
      ? "⚠️"
      : "ℹ️";

  const confirmBtnClass =
    variant === "danger"
      ? "btn btn-danger"
      : variant === "warning"
      ? "btn btn-warning"
      : "btn btn-primary";

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{icon}</div>
          <h2>{title}</h2>
          <p style={{ color: "var(--color-text-light)", marginTop: "0.5rem", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>
        <div className="form-actions" style={{ justifyContent: "center" }}>
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={confirmBtnClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}