document.addEventListener('DOMContentLoaded', () => {
    let allPizzas = [];
    let cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
    let currentFilter = 'Усі';
    const pizzaListContainer = document.querySelector('.pizza-list');
    const pizzaCountBadge = document.querySelector('.pizza-count-badge');
    const categoryButtonsContainer = document.querySelector('.category-buttons');
    const orderItemsContainer = document.querySelector('.order-items');
    const orderCountBadge = document.querySelector('.order-header .order-count-badge');
    const totalPriceElement = document.querySelector('.total-price');
    const clearOrderButton = document.querySelector('.clear-order-button');
    const checkoutButton = document.querySelector('.checkout-button');
    const headerPizzasLink = document.querySelector('.header-pizzas-link');

    const createPizzaCard = (pizza) => {
        const pizzaCard = document.createElement('div');
        pizzaCard.classList.add('pizza-card');

        if (pizza.badges && pizza.badges.length > 0) {
            pizza.badges.forEach(badgeText => {
                const badge = document.createElement('span');
                badge.classList.add('badge');
                if (badgeText === 'Нова') {
                    badge.classList.add('new');
                } else if (badgeText === 'Популярна') {
                    badge.classList.add('popular');
                }
                badge.textContent = badgeText;
                pizzaCard.appendChild(badge);
            });
        }

        pizzaCard.innerHTML += `
            <img src="${pizza.image}" alt="Піца ${pizza.name}">
            <h3>${pizza.name}</h3>
            <div class="pizza-type">${pizza.type}</div>
            <p class="pizza-description">${pizza.description}</p>
            <div class="pizza-options-wrapper">
                ${pizza.prices.map(option => `
                    <div class="pizza-option-block">
                        <div class="pizza-size-info">
                            <span class="diameter"><span class="diameter-icon">&Oslash;</span> ${option.size}</span>
                            <span class="weight">${option.weight}</span>
                        </div>
                        <div class="pizza-price-block">
                            ${option.price} <span class="currency">грн.</span>
                        </div>
                        <button class="buy-button"
                                data-pizza-id="${pizza.id}"
                                data-pizza-name="${pizza.name}"
                                data-pizza-image="${pizza.image}"
                                data-pizza-size="${option.size}"
                                data-pizza-weight="${option.weight}"
                                data-pizza-price="${option.price}"
                                data-tooltip="Додати піцу до кошика">
                            Купити
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        return pizzaCard;
    };

    const displayPizzas = (pizzasToDisplay) => {
        pizzaListContainer.innerHTML = '';
        let visiblePizzasCount = 0;

        pizzasToDisplay.forEach(pizza => {
            if (currentFilter === 'Усі' || pizza.type === currentFilter ||
               (currentFilter === 'Вега' && (pizza.type === 'Вега' || pizza.type === 'Вегетаріанська піца')) ||
               (currentFilter === "М'ясні" && pizza.type === "М'ясна піца") ||
               (currentFilter === 'З ананасами' && pizza.type === 'Піца з ананасами') ||
               (currentFilter === 'З грибами' && pizza.type === 'З грибами') ||
               (currentFilter === 'З морепродуктами' && pizza.type === 'З морепродуктами')
            ) {
                const card = createPizzaCard(pizza);
                pizzaListContainer.appendChild(card);
                visiblePizzasCount++;
            }
        });
        pizzaCountBadge.textContent = visiblePizzasCount;
        addBuyButtonListeners();
    };

    const createCategoryButtons = (pizzas) => {
        const allCategories = new Set();
        allCategories.add('Усі');
        pizzas.forEach(pizza => {
            allCategories.add(pizza.type);
        });

        const categoryMapping = {
            "М'ясна піца": "М'ясні",
            "Піца з ананасами": "З ананасами",
            "З грибами": "З грибами",
            "З морепродуктами": "З морепродуктами",
            "Вега": "Вега",
            "Вегетаріанська піца": "Вега"
        };
        categoryButtonsContainer.innerHTML = '';

        allCategories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('category-button');
            const buttonText = categoryMapping[category] || category;
            button.textContent = buttonText;
            button.dataset.tooltip = `Піца ${buttonText.toLowerCase()}`;

            if (buttonText === 'Усі') {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilter = category;
                displayPizzas(allPizzas);
            });
            categoryButtonsContainer.appendChild(button);
        });
    };
    // --- Завантаження даних з JSON ---
    const loadPizzas = async () => {
        try {
            const response = await fetch('pizzas.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allPizzas = await response.json(); // Зберігаємо завантажені піци
            createCategoryButtons(allPizzas);
            displayPizzas(allPizzas);
        } catch (error) {
            console.error('Не вдалося завантажити піци:', error);
            pizzaListContainer.innerHTML = '<p>Не вдалося завантажити список піц. Будь ласка, спробуйте пізніше.</p>';
        }
    };

    const saveCartToLocalStorage = () => {
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
    };

    const updateCartView = () => {
        orderItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p style="text-align:center; color:#777;">Ваше замовлення порожнє</p>';
        } else {
            cart.forEach(item => {
                const itemHtml = `
                    <div class="order-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h4>${item.name} (${item.size_text})</h4>
                            <div class="item-size-info">
                                <span>&Oslash; ${item.size}</span>
                                <span class="weight">${item.weight}</span>
                            </div>
                            <div class="item-price-quantity">
                                <span class="item-price">${item.price * item.quantity} <span class="currency">грн</span></span>
                                <div class="quantity-controls">
                                    <button class="quantity-btn minus" data-tooltip="Зменшити кількість">-</button>
                                    <input type="text" value="${item.quantity}" class="quantity-input" readonly>
                                    <button class="quantity-btn plus" data-tooltip="Збільшити кількість">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                orderItemsContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        orderCountBadge.textContent = totalItems;
        totalPriceElement.innerHTML = `${totalPrice} <span class="currency">грн</span>`;
        addQuantityListeners();
        saveCartToLocalStorage();
    };

    const addToCart = (pizzaData) => {
        const itemIdentifier = `${pizzaData.name}-${pizzaData.size}`;
        const existingItem = cart.find(item => item.id === itemIdentifier);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            const sizeText = pizzaData.size === 30 ? 'Мала' : 'Велика';
            cart.push({
                id: itemIdentifier,
                name: pizzaData.name,
                image: pizzaData.image,
                size: pizzaData.size,
                size_text: sizeText,
                weight: pizzaData.weight,
                price: pizzaData.price,
                quantity: 1
            });
        }
        updateCartView();
    };
    const increaseQuantity = (id) => {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity++;
        }
        updateCartView();
    };
    const decreaseQuantity = (id) => {
        let itemFound = false;
        cart = cart.map(item => {
            if (item.id === id) {
                itemFound = true;
                item.quantity--;
            }
            return item;
        }).filter(item => item.quantity > 0);
        updateCartView();
    };

    const addQuantityListeners = () => {
        
        orderItemsContainer.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.onclick = (e) => {
                const id = e.target.closest('.order-item').dataset.id;
                increaseQuantity(id);
            };
        });
        orderItemsContainer.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.onclick = (e) => {
                const id = e.target.closest('.order-item').dataset.id;
                decreaseQuantity(id);
            };
        });
    };

    const addBuyButtonListeners = () => {
        document.querySelectorAll('.buy-button').forEach(button => {
            button.onclick = (e) => {
                const pizzaData = {
                    id: e.target.dataset.pizzaId,
                    name: e.target.dataset.pizzaName,
                    image: e.target.dataset.pizzaImage,
                    size: parseInt(e.target.dataset.pizzaSize),
                    weight: parseInt(e.target.dataset.pizzaWeight),
                    price: parseInt(e.target.dataset.pizzaPrice)
                };
                addToCart(pizzaData);
            };
        });
    };

    clearOrderButton.addEventListener('click', () => {
        cart = [];
        updateCartView();
    });

    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Ваш кошик порожній. Будь ласка, додайте піцу, щоб зробити замовлення.');
            return;
        }
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        console.log('Нове замовлення:', cart);
        console.log('Загальна сума:', totalPrice, 'грн.');
        alert(`Ваше замовлення на суму ${totalPrice} грн прийнято! Дякуємо, що обрали PIZZA KMA!`);
        cart = [];
        updateCartView();
    });

    loadPizzas();
    updateCartView();
});
