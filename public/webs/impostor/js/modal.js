/**
 * modal.js - Sistema de modales personalizados
 */

const modalManager = {
    // Mostrar modal de error
    showError(message) {
        const modal = document.getElementById('error-modal');
        const messageElement = document.getElementById('error-message');

        messageElement.textContent = message;
        modal.classList.add('active');
    },

    // Ocultar modal de error
    hideError() {
        const modal = document.getElementById('error-modal');
        modal.classList.remove('active');
    },

    // Mostrar modal de éxito
    showSuccess(message) {
        const modal = document.getElementById('success-modal');
        const messageElement = document.getElementById('success-message');

        messageElement.textContent = message;
        modal.classList.add('active');
    },

    // Ocultar modal de éxito
    hideSuccess() {
        const modal = document.getElementById('success-modal');
        modal.classList.remove('active');
    },

    // Mostrar modal de confirmación
    showConfirm(message, onAccept, onCancel) {
        const modal = document.getElementById('confirm-modal');
        const messageElement = document.getElementById('confirm-message');

        messageElement.textContent = message;
        modal.classList.add('active');

        // Guardar callbacks
        this._confirmAcceptCallback = onAccept;
        this._confirmCancelCallback = onCancel;
    },

    // Ocultar modal de confirmación
    hideConfirm() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('active');
        this._confirmAcceptCallback = null;
        this._confirmCancelCallback = null;
    },

    // Aceptar confirmación
    acceptConfirm() {
        if (this._confirmAcceptCallback) {
            this._confirmAcceptCallback();
        }
        this.hideConfirm();
    },

    // Cancelar confirmación
    cancelConfirm() {
        if (this._confirmCancelCallback) {
            this._confirmCancelCallback();
        }
        this.hideConfirm();
    }
};

// Event Listeners
function initModals() {
    // Botón OK del modal de error
    const errorOkBtn = document.getElementById('error-ok-btn');
    if (errorOkBtn) {
        errorOkBtn.addEventListener('click', () => {
            modalManager.hideError();
        });
    }

    // Cerrar modal al hacer click fuera
    const errorModal = document.getElementById('error-modal');
    if (errorModal) {
        errorModal.addEventListener('click', (e) => {
            if (e.target === errorModal) {
                modalManager.hideError();
            }
        });
    }

    // Botón OK del modal de éxito
    const successOkBtn = document.getElementById('success-ok-btn');
    if (successOkBtn) {
        successOkBtn.addEventListener('click', () => {
            modalManager.hideSuccess();
        });
    }

    // Cerrar modal de éxito al hacer click fuera
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                modalManager.hideSuccess();
            }
        });
    }

    // Botones del modal de confirmación
    const confirmAcceptBtn = document.getElementById('confirm-accept-btn');
    if (confirmAcceptBtn) {
        confirmAcceptBtn.addEventListener('click', () => {
            modalManager.acceptConfirm();
        });
    }

    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => {
            modalManager.cancelConfirm();
        });
    }

    // Cerrar modal de confirmación al hacer click fuera
    const confirmModal = document.getElementById('confirm-modal');
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                modalManager.cancelConfirm();
            }
        });
    }
}

export { modalManager, initModals };
