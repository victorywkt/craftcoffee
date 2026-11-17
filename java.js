// Конфігурація регулярних виразів
const REGEX_NAME = /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ'\s-]+$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_PHONE = /^\+380\d{9}$/;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const agreementInput = document.getElementById('agreement');

    // --- Елементи модального вікна успіху ---
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-success-modal');
    const modalBackdrop = document.getElementById('success-modal-backdrop');
    let lastFocusedElement = null;

    function openSuccessModal() {
        lastFocusedElement = document.activeElement;
        if (successModal) {
            successModal.classList.remove('hidden');
            if (closeModalBtn) closeModalBtn.focus();
        }
    }

    function closeSuccessModal() {
        if (successModal) {
            successModal.classList.add('hidden');
            if (lastFocusedElement) lastFocusedElement.focus();
        }
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeSuccessModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeSuccessModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && successModal && !successModal.classList.contains('hidden')) {
            closeSuccessModal();
        }
    });

    // --- UI-ФУНКЦІЇ КЕРУВАННЯ СТАНАМИ ---

    function showError(input, errorId, message = null) {
        const errorElement = document.getElementById(errorId);
        
        if (input.type !== 'checkbox') {
            input.classList.remove('border-warmBorder', 'border-green-500');
            input.classList.add('border-red-500');
        }
        input.setAttribute('aria-invalid', 'true');

        if (errorElement) {
            if (message) errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    function showSuccess(input, errorId) {
        const errorElement = document.getElementById(errorId);

        if (input.type !== 'checkbox') {
            input.classList.remove('border-warmBorder', 'border-red-500');
            input.classList.add('border-green-500');
        }
        input.setAttribute('aria-invalid', 'false');

        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    function clearError(input, errorId) {
        const errorElement = document.getElementById(errorId);

        if (input.type !== 'checkbox') {
            input.classList.remove('border-red-500', 'border-green-500');
            input.classList.add('border-warmBorder');
        }
        input.setAttribute('aria-invalid', 'false');

        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }

    // --- ФУНКЦІЇ ВАЛІДАЦІЇ ОКРЕМИХ ПОЛІВ ---

    function validateName(showErrors = true) {
        const value = usernameInput.value.trim();
        if (value === '') {
            if (showErrors) clearError(usernameInput, 'nameError');
            return false;
        }
        if (value.length < 2 || !REGEX_NAME.test(value)) {
            if (showErrors) showError(usernameInput, 'nameError', "Введіть коректне ім'я (мінімум 2 символи, лише літери).");
            return false;
        }
        showSuccess(usernameInput, 'nameError');
        return true;
    }

    function validateEmail(showErrors = true) {
        const value = emailInput.value.trim();
        if (value === '') {
            if (showErrors) clearError(emailInput, 'emailError');
            return false;
        }
        if (!REGEX_EMAIL.test(value)) {
            if (showErrors) showError(emailInput, 'emailError', 'Введіть коректну електронну адресу.');
            return false;
        }
        showSuccess(emailInput, 'emailError');
        return true;
    }

    function sanitizeAndFormatPhone() {
        let val = phoneInput.value.trim();

        if (val.startsWith('0') && val.length > 1) {
            val = '+380' + val.substring(1);
        } else if (/^\d{9}$/.test(val)) {
            val = '+380' + val;
        }

        let cleaned = '';
        for (let i = 0; i < val.length; i++) {
            let char = val[i];
            if (i === 0 && char === '+') {
                cleaned += '+';
            } else if (/\d/.test(char)) {
                cleaned += char;
            }
        }

        if (cleaned.startsWith('+380') && cleaned.length > 13) {
            cleaned = cleaned.substring(0, 13);
        }

        if (phoneInput.value !== cleaned) {
            phoneInput.value = cleaned;
        }
    }

    function validatePhone(showErrors = true) {
        sanitizeAndFormatPhone();
        const value = phoneInput.value.trim();
        
        if (value === '') {
            if (showErrors) clearError(phoneInput, 'phoneError');
            return false;
        }
        if (!REGEX_PHONE.test(value)) {
            if (showErrors) showError(phoneInput, 'phoneError', 'Введіть номер у строгому форматі +380XXXXXXXXX.');
            return false;
        }
        showSuccess(phoneInput, 'phoneError');
        return true;
    }

    function validateMessage(showErrors = true) {
        const value = messageInput.value.trim();
        if (value === '') {
            if (showErrors) clearError(messageInput, 'messageError');
            return false;
        }
        if (value.length < 10) {
            if (showErrors) showError(messageInput, 'messageError', 'Повідомлення занадто коротке (мінімум 10 символів).');
            return false;
        }
        showSuccess(messageInput, 'messageError');
        return true;
    }

    function validateAgreement(showErrors = true) {
        if (!agreementInput.checked) {
            if (showErrors) showError(agreementInput, 'agreementError', 'Потрібна ваша згода для продовження.');
            return false;
        }
        showSuccess(agreementInput, 'agreementError');
        return true;
    }

    // --- ДИНАМІЧНА ПРИВ'ЯЗКА ПОДІЙ ---
    usernameInput.addEventListener('input', () => validateName(false));
    emailInput.addEventListener('input', () => validateEmail(false));
    phoneInput.addEventListener('input', () => validatePhone(false));
    messageInput.addEventListener('input', () => validateMessage(false));
    agreementInput.addEventListener('change', () => validateAgreement(false));

    usernameInput.addEventListener('blur', () => validateName(true));
    emailInput.addEventListener('blur', () => validateEmail(true));
    phoneInput.addEventListener('blur', () => validatePhone(true));
    messageInput.addEventListener('blur', () => validateMessage(true));

    // --- ОБРОБКА SUBMIT ---
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const isNameValid = validateName(true);
        const isEmailValid = validateEmail(true);
        const isPhoneValid = validatePhone(true);
        const isMessageValid = validateMessage(true);
        const isAgreementValid = validateAgreement(true);

        const isFormValid = isNameValid && isEmailValid && isPhoneValid && isMessageValid && isAgreementValid;

        if (!isFormValid) {
            const firstInvalid = form.querySelector('[aria-invalid="true"]');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // Відкриваємо доступне модальне вікно успіху
        openSuccessModal();
        
        form.reset();
        clearError(usernameInput, 'nameError');
        clearError(emailError, 'emailError');
        clearError(phoneError, 'phoneError');
        clearError(messageError, 'messageError');
        clearError(agreementInput, 'agreementError');
    });
});