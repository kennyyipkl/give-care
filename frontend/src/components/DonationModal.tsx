import { useState } from "react";

interface DonationModalProps {
  photoTitle: string;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

export default function DonationModal({ photoTitle, onConfirm, onCancel }: DonationModalProps) {
  const [amount, setAmount] = useState("10");
  const [customAmount, setCustomAmount] = useState(false);

  const presets = [10, 20, 50, 100, 500];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    onConfirm(num);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-donation" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>✕</button>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>❤️</div>
          <h2>Make a Donation</h2>
          <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem" }}>
            Support: <strong>{photoTitle}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>
              Choose Amount ($)
            </label>
            <div className="donation-presets">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`donation-preset-btn ${!customAmount && parseFloat(amount) === p ? "active" : ""}`}
                  onClick={() => { setAmount(String(p)); setCustomAmount(false); }}
                >
                  ${p}
                </button>
              ))}
              <button
                type="button"
                className={`donation-preset-btn custom ${customAmount ? "active" : ""}`}
                onClick={() => { setCustomAmount(true); setAmount(""); }}
              >
                Custom
              </button>
            </div>
            {customAmount && (
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Enter amount..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                style={{ marginTop: "0.75rem" }}
              />
            )}
            {!customAmount && (
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ marginTop: "0.75rem" }}
              />
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              ❤️ Donate ${parseFloat(amount) > 0 ? parseFloat(amount).toFixed(0) : "0"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}