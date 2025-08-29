document.addEventListener('DOMContentLoaded', function () {
    const vakJournals = ['economic', 'law', 'philosophy', 'history']
    const publishingHouseInput = document.getElementById('publishing-house');
    const publishingAdditionInput = document.getElementById('publishing-addition');
    const onPayButton = document.getElementById('onPayButton');
    const actionCardBtns = document.querySelectorAll('.card');

    /**
     * Проерка на сафари
     */
    if (navigator.userAgent.indexOf('Safari') != -1 &&
        navigator.userAgent.indexOf('Chrome') == -1) {
        document.body.classList.addClass("safari");
    }

    /**
     * Конвертация числа цены в строку
     */
    const convertToPriceString = (number) => number ? number.toLocaleString('ru') : null;


    /**
     * Обновление инпутов
     */
    const updateInput = (input) => {
        const cardsActive = input.closest('.block').querySelectorAll('.card.active');

        const valueArr = [];
        cardsActive.forEach((card) => valueArr.push(card.id))

        input.value = valueArr.join(',');
    }

    /**
     * Обновление степпера
     */
    let stepsFinish = 0;
    const updateStepper = () => {
        const stepper = document.getElementById('stepper');
        const steps = stepper.querySelectorAll('.stepper__step');

        if (!publishingHouseInput?.value && !publishingAdditionInput?.value) stepsFinish = 0;
        if (publishingHouseInput?.value || publishingAdditionInput?.value) stepsFinish = 1;
        if (publishingHouseInput?.value && publishingAdditionInput?.value) stepsFinish = 2;

        steps.forEach((step, index) => {
            if (stepsFinish >= index) {
                step.classList.add('finish')
            } else {
                step.classList.remove('finish')
            }
        })
    }

    /**
     * Обновление итоговых цен
     */
    const smallPriceFooter = document.querySelector('.footer__price .footer__price-small');
    const bigPriceFooter = document.querySelector('.footer__price .footer__price-big');
    const smallPriceModalFooter = document.querySelector('.payment__actions .price .price__small');
    const bidPriceModalFooter = document.querySelector('.payment__actions .price .price__big');

    const updateFooterPrice = () => {
        const allFields = [publishingHouseInput?.value, publishingAdditionInput?.value].join(',');

        const prices = allFields.split(',').reduce((acc, cur) => {
            const card = document.getElementById(cur)
            if (!card) return acc;

            const smallPrice = card.querySelector('.card__price-small')?.innerHTML;
            const bigPrice = card.querySelector('.card__price-big')?.innerHTML;

            return {
                ...acc,
                small: acc.small + parseInt(smallPrice.replace(/ /g, '')),
                big: acc.big + parseInt(bigPrice.replace(/ /g, '')),
            }
        }, {small: 0, big: 0});

        const smallPriceValueString = convertToPriceString(prices.small) ? `${convertToPriceString(prices.small)} ₽` : '';
        const bigPriceValueString = convertToPriceString(prices.big) ? `${convertToPriceString(prices.big)} ₽` : '';

        smallPriceFooter.innerHTML = smallPriceValueString;
        bigPriceFooter.innerHTML = bigPriceValueString;

        smallPriceModalFooter.innerHTML = smallPriceValueString;
        bidPriceModalFooter.innerHTML = bigPriceValueString;
    }


    const selectOption = (cardId) => {
        const card = document.getElementById(cardId);
        const cardActionBtn = card.querySelector('.card__action .btn');

        /**
         * Если второй клик по активной карточке то снимаем актив
         */
        if (card.classList.contains('active')) {

            /**
             * Если журнал вак то снимаем все мутеды и активы
             */
            if (vakJournals.includes(cardId)) {
                const siblingsCard = card?.closest('.block__table').querySelectorAll('.card');

                const filteredSiblingsCard = Array.from(siblingsCard)?.filter((siblingCard) => vakJournals.includes(siblingCard.id))
                filteredSiblingsCard.forEach((siblingCard) => {
                    const siblingCardActionBtn = siblingCard.querySelector('.btn-checked');

                    if (siblingCardActionBtn) {
                        siblingCardActionBtn.innerHTML = 'Выбрать';
                        siblingCardActionBtn.classList.remove('btn-checked');
                    }

                    siblingCard.classList.remove('active');
                    siblingCard.classList.remove('card_disabled');
                })
            } else {
                cardActionBtn.classList.remove('btn-checked');
                cardActionBtn.innerText = 'Выбрать';

                card.classList.remove('active');
            }

            updateInput(publishingHouseInput);
            updateInput(publishingAdditionInput);
            updatePaymentAmount();
            updateFooterPrice();
            updateStepper();
            return;
        }

        if (vakJournals.includes(cardId)) {
            const siblingsCard = card?.closest('.block__table').querySelectorAll('.card');

            const filteredSiblingsCard = Array.from(siblingsCard)?.filter((siblingCard) => cardId !== siblingCard.id && vakJournals.includes(siblingCard.id))
            filteredSiblingsCard.forEach((siblingCard) => {
                const siblingCardActionBtn = siblingCard.querySelector('.btn-checked');

                if (siblingCardActionBtn) {
                    siblingCardActionBtn.innerHTML = 'Выбрать';
                    siblingCardActionBtn.classList.remove('btn-checked');
                }

                siblingCard.classList.remove('active');
                siblingCard.classList.add('card_disabled');
            })
        }


        cardActionBtn.classList.add('btn-checked');
        cardActionBtn.innerText = '';

        card.classList.remove('card_disabled');
        card.classList.add('active');

        updateInput(publishingHouseInput);
        updateInput(publishingAdditionInput);
        updatePaymentAmount();
        updateFooterPrice();
        updateStepper();
    }

    const handleClickCard = (event) => {
        if (event.target.closest('.card__header') || event.target.closest('.card__modal')) return;
        const card = event.currentTarget.closest('.card');
        const cardId = card?.id;

        selectOption(cardId);
    }

    actionCardBtns.forEach((btn) => btn?.addEventListener('click', handleClickCard))


    /**
     * Обновление чекбоксов в модалке оплаты
     */
    const allCheckboxesInModal = document.querySelectorAll('.modal[data-modal-name="main"] .checkbox-button .checkbox-button__input');
    const updateInfoInPaymentModal = () => {
        const allFields = [publishingHouseInput?.value, publishingAdditionInput?.value].join(',').split(',');
        allCheckboxesInModal.forEach((checkbox) => {
            checkbox.checked = allFields.includes(checkbox.id.replace('Check', ''))
        });
        const inputInModals = document.querySelectorAll('#persone-form2 .text-input__input');

        Array.from(inputInModals).forEach((input) => {
            const thisInputOut = document.querySelector(`#persone-form input[name="${input.name}"]`)
            input.value = thisInputOut.value;
        })
    }

    /**
     * Клик по чекбоксу внутри модалки оплаты
     */
    const handleChangeCheckbox = (event) => {
        const field = event.currentTarget;
        const fieldId = field?.id.replace('Check', '');

        if (field.checked && vakJournals.includes(fieldId)) {
            const siblingsCheckbox = field?.closest('.checkbox-group__table').querySelectorAll('.checkbox-button__input');
            const filteredSiblingsCheckbox = Array.from(siblingsCheckbox)?.filter((siblingCheckbox) => vakJournals.includes(siblingCheckbox.id.replace('Check', '')))

            filteredSiblingsCheckbox.forEach((siblingsCheckbox) => {
                siblingsCheckbox.checked = false;
            })

            field.checked = true;
        }
        selectOption(fieldId);
    }

    allCheckboxesInModal.forEach((checkbox) => checkbox?.addEventListener('click', handleChangeCheckbox))


    /**
     * Клик кнопки выбора внутри модалок "подробнее"
     */
    const choiceServiceFromModal = (event) => {
        const button = event.currentTarget;
        const nameService = button?.dataset.choiceTarget;
        const modal = button.closest('.modal');
        const allValues = [publishingHouseInput?.value, publishingAdditionInput?.value].join(',').split(',');

        if (!allValues.includes(nameService)) {
            selectOption(nameService);
        }

        document.body.style.overflow = '';
        modal?.classList.remove('open');
    }
    const choiceBtns = document.querySelectorAll('.choice-in-modal .choice-in-modal__btn');
    choiceBtns.forEach((btn) => btn?.addEventListener('click', choiceServiceFromModal))

    /**
     * Обновление значения формы оплаты
     */
    const updatePaymentAmount = () => {
        const amountInput = document.querySelector('.tinkoffPayRow[name="amount"]');
        const allPrices = document.querySelectorAll('.card.active .card__price-big');

        const resultAmount = Array.from(allPrices).reduce((acc, cur) => {
            const priceString = cur.innerHTML
            const priceNumber = parseInt(priceString.replace(/ /g, ''));
            return acc += priceNumber
        }, 0)

        onPayButton.disabled = !resultAmount;

        amountInput.value = resultAmount;
    }

    const personeForm = document.getElementById('persone-form2');
    const contactForm = document.getElementById('contacts');

    /**
     * Валидация формы
     */
    const validatePersonalForm = (form) => {
        const reqTextInputs = form.querySelectorAll('input[required][type="text"]');
        const reqCheckboxInputs = form.querySelectorAll('input[required][type="checkbox"]');
        const unvalidRequiredTextInput = Array.from(reqTextInputs).filter((input) => !input.value);
        const unvalidRequiredCheckInput = Array.from(reqCheckboxInputs).filter((input) => !input.checked);


        unvalidRequiredTextInput.forEach((input) => {
            const inputController = input.closest('.text-input');
            if (inputController.classList.contains('error')) return;

            const errorRequired = document.createElement("span");
            errorRequired.classList.add('text-input__error-text');
            errorRequired.append('Поле не заполнено');

            inputController?.classList.add('error');
            inputController.append(errorRequired);

            input.addEventListener('input', () => {
                inputController?.classList.remove('error');
                inputController.querySelector('.text-input__error-text')?.remove();
            })
        })

        unvalidRequiredCheckInput.forEach((checkbox) => {
            const inputController = checkbox.closest('.checkbox');
            inputController.classList.add('error');

            checkbox.addEventListener('change', () => {
                inputController?.classList.remove('error');
                inputController.querySelector('.text-input__error-text')?.remove();
            })
        })

        return unvalidRequiredTextInput.length === 0 && unvalidRequiredCheckInput.length === 0;
    }

    /**
     * Клик по кнопке консультации
     */
    const btnConsultation = document.querySelectorAll('.modal .btn-consultation');
    const handleClickConsultation = async (event) => {
        const btnConsultation = event.currentTarget;
        const modal = btnConsultation.closest('.modal').dataset.modalName
        const form = modal === 'contacts' ? contactForm : personeForm;

        const isValidForm = validatePersonalForm(form);
        if (!isValidForm) return;
        btnConsultation.classList.remove('success');
        btnConsultation.classList.add('loading');

        const inputs = form.querySelectorAll('.text-input__input');

        const data = Array.from(inputs).reduce((acc, cur) => ({
            ...acc,
            [cur.name]: cur.value,
        }), {});

        const message = `#uptitle
*Заказ консультации*

Имя: ${data?.name};
Телефон: ${data?.phone};
E-mail: ${data?.email}`

        const response = new Promise((resolve) => {
            setTimeout(() => {
                return resolve()
            }, 500)
        })

        try {
            await response
        } catch (e) {
            console.error(e)
        }

        btnConsultation.classList.remove('loading');
        btnConsultation.classList.add('success');

    };

    btnConsultation?.forEach((btn) => btn?.addEventListener('click', handleClickConsultation));

    const stringToHSA256 = async (text) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray
            .map((bytes) => bytes.toString(16).padStart(2, '0'))
            .join('');
        return hashHex;
    };


    /**
     * Оплата тинькофф
     */
    const tinkoffPay = async () => {
        const isValidForm = validatePersonalForm(personeForm);
        if (!isValidForm) return;
        onPayButton.classList.remove('success');
        onPayButton.classList.add('loading');

        const orderId = Math.floor(Math.random() * Date.now());
        const amountInput = document.querySelector('.tinkoffPayRow[name="amount"]');
        const inputs = personeForm.querySelectorAll('.text-input__input');
        const data = Array.from(inputs).reduce((acc, cur) => ({
            ...acc,
            [cur.name]: cur.value,
        }), {});

        const cards = document.querySelectorAll('.card.active')
        let description = [];
        cards.forEach((card) => {
            const cardTitle = card.querySelector('.card__title')?.innerHTML
            if (cardTitle) {
                description.push(cardTitle.replaceAll(',', ''))
            }
        })

        const descriptionForTinkoff = `Список услуг: ${description.join(';')}`

        const resultAmount = `${amountInput?.value}00`;

        const tokenString = `${resultAmount}${descriptionForTinkoff}${orderId}${'terminalPass'}${'terminalKey'}`;

        const tokenHash = await stringToHSA256(tokenString);

        const reqData = {
            "TerminalKey": 'terminalKey',
            "Amount": 'resultAmount',
            "OrderId": orderId,
            "Description": descriptionForTinkoff,
            "Token": tokenHash,
            "DATA": {
                "Name": data?.name,
                "Phone": data?.phone,
                "Email": data?.email,
            }
        }

        const message = `*⚠️Пользователь перешел к оплате*

*📍Список услуг*: ${description.reduce((acc, item) => acc += `${item};\n`, '')}
👤Имя: ${data?.name};
📞Телефон: ${data?.phone};
📬E-mail: ${data?.email};

Заказ №: #order${orderId};
Сумма: ${amountInput?.value} рублей;`

        const response = new Promise((resolve) => {
            setTimeout(() => {
                return resolve()
            }, 500)
        })

        try {
            await response
        } catch (e) {
            console.error(e)
        }


        onPayButton.classList.remove('loading');
        onPayButton.classList.add('success');
    }


    onPayButton.addEventListener('click', tinkoffPay);

    /**
     * Открытие модалок
     */
    const showModal = (event) => {
        const targetModal = event.currentTarget?.dataset.modalTarget;
        if (targetModal === 'main') {
            updateInfoInPaymentModal();
        }
        const modal = document.querySelector(`.modal[data-modal-name="${targetModal}"]`);

        document.body.style.overflow = 'hidden';
        modal?.classList.add('open');
    }

    /**
     * Закрытие
     */
    const closeModal = (event) => {
        const modal = event.currentTarget?.closest('.modal');

        document.body.style.overflow = '';
        modal?.classList.remove('open');
    }

    const modalsBtn = document.querySelectorAll('[data-modal-target]');
    const modalsClose = document.querySelectorAll('.modal .modal__close');

    modalsBtn.forEach((modal) => modal?.addEventListener('click', showModal));
    modalsClose.forEach((modal) => modal?.addEventListener('click', closeModal));

    /**
     * Закрытие модалки через esc
     */
    const closeActiveModal = (event) => {
        if (event?.key?.toLowerCase() === "escape") {
            const activeModal = document.querySelector('.modal.open');
            activeModal?.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
    window?.addEventListener('keydown', closeActiveModal);


    updateInput(publishingHouseInput);
    updateInput(publishingAdditionInput);
    updatePaymentAmount();
    updateFooterPrice();
    updateStepper();


    /**
     * Включение модалок с успешной и не успешной оплатой
     */
    const getParameterByName = (paramName) => {
        let match = RegExp('[?&]' + paramName + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

    const paymentResultQuery = getParameterByName("payment-result");
    const showPaymentResultModal = () => {
        if (!paymentResultQuery) return;
        const paymentResultModalName = paymentResultQuery === 'success' ? 'result-payment-success' : 'result-payment-failure';
        const modal = document.querySelector(`.modal[data-modal-name="${paymentResultModalName}"]`)

        const url = new URL(document.location);
        const searchParams = url.searchParams;
        searchParams.delete("payment-result");
        window.history.pushState({}, '', url.toString())

        if (!modal) return;

        document.body.style.overflow = 'hidden';
        modal.classList.add('open');
    }
    showPaymentResultModal();

})
