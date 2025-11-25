function Modal({ show, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-8 w-auto rounded-3xl shadow-xl flex flex-col items-center gap-4">
                <h4 className="text-center">{title}</h4>
                <h5 className="text-center text-[var(--neutral2)]">{message}</h5>

                <div className="flex gap-4 mt-2">
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 rounded-2xl bg-[var(--blue3)] text-white hover:bg-[var(--blue2)] transition-all"
                    >
                        {confirmText}
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-5 py-2 rounded-2xl border border-[var(--neutral3)] text-[var(--neutral3)] hover:bg-[var(--neutral1)] transition-all"
                        >
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Modal;
