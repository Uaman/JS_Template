document.addEventListener('DOMContentLoaded', () => {
    //посилання на ключові елементи DOM з якими будемо взаємодіяти
    const pizzaList = document.getElementById('pizza-list'); //елемент куди будемо вставляти картки піц
    const cartItemsList = document.getElementById('cart-items'); //елемент куди будемо вставляти елементи кошика
    const pizzaCountSpan = document.querySelector('.pizza-header .pizza-count'); //елемент для відображення кількості піц
    const cartCountSpan = document.querySelector('.cart-header .cart-count'); //елемент для відображення кількості товарів у кошику
    const totalPriceSpan = document.querySelector('.total-price'); //елемент для відображення загальної суми замовлення
    const filterButtons = document.querySelectorAll('.filter-btn'); //всі фільтри
    const clearCartButton = document.querySelector('.clear-cart'); //кнопка очищення кошика

    let allPizzas = []; //змінна для зберігання всіх піц з JSON
    //завантажує дані кошика з local storage (порожній масив якщо сторедж пустий)
    let cart = JSON.parse(localStorage.getItem('pizzaCart')) || []; 
    //функція для асинхронного завантаження списку піц з JSON
    async function loadPizzas() {
        try {
            //HTTP-запит до json
            const response = await fetch('pizzas.json');
            if (!response.ok) {
                throw new Error(`помилка HTTP: ${response.status}`);
            }
            //парсимо відповідь у форматі JSON та зберігаємо її в allPizzas
            allPizzas = await response.json();
            //відображаємо всі піци за замовчуванням
            displayPizzas('all'); 
        } catch (error) {
            console.error('Не вдалося завантажити піци:', error);
            pizzaList.innerHTML = '<p>Не вдалося завантажити список піц. Будь ласка, спробуйте пізніше.</p>';
        }
    }

    //для відображення піц на сторінці відповідно до обраного фільтра
    function displayPizzas(filter) {
        pizzaList.innerHTML = ''; //очищаємо поточний вміст списку піц перед оновленням
        let filteredPizzas = []; //змінна для зберігання відфільтрованих піц
        if (filter === 'all') {
            filteredPizzas = allPizzas; //якщо фільтр "all" то показуємо всі піци
        } else {
            //залишає ті піци у яких масив 'categories' містить значення поточного фільтра.
            filteredPizzas = allPizzas.filter(pizza => pizza.categories.includes(filter));
        }
        pizzaCountSpan.textContent = filteredPizzas.length; //оновлюємо лічильник кількості піц на сторінці
        //якщо після фільтрації немає піц виводимо повідомлення
        if (filteredPizzas.length === 0) {
            pizzaList.innerHTML = '<p>Піци за даним фільтром відсутні.</p>';
            return;
        }

        //для кожної відфільтрованої піци створюємо та додаємо картку на сторінку
        filteredPizzas.forEach(pizza => {
            const pizzaCard = document.createElement('article'); //створюємо новий HTML-елемент <article>
            pizzaCard.classList.add('pizza-card'); //додаємо клас 'pizza-card' для стилізації
            let badgeHtml = ''; //змінна для зберігання HTML-коду для бейджа (Нова/Популярна)
            if (pizza.isNew) {
                badgeHtml = '<span class="badge new-badge">Нова</span>'; //якщо піца нова додаємо бейдж "Нова"
            } else if (pizza.isPopular) {
                badgeHtml = '<span class="badge popular-badge">Популярна</span>'; //якщо піца популярна додаємо бейдж "Популярна"
            }
            let purchaseOptionsHtml = ''; //змінна для зберігання HTML-коду опцій покупки (розміри, ціни, кнопки)
            //генеруємо HTML для кожної опції розміру/ціни піци
            pizza.prices.forEach(option => {
                purchaseOptionsHtml += `
                    <div class="purchase-option">
                        <div class="specs">
                            <div class="spec-item"><img src="images/size-icon.svg" alt="Діаметр" class="icon"> <span>${option.size}</span></div>
                            <div class="spec-item"><img src="images/weight.svg" alt="Вага" class="icon"> <span>${option.weight}г</span></div>
                        </div>
                        <span class="price">${option.price} грн.</span>
                        <button class="buy-button" data-pizza-id="${pizza.id}" data-pizza-size="${option.size}" data-pizza-price="${option.price}" data-pizza-weight="${option.weight}">Купити</button>
                    </div>
                `;
            });

            //вставляємо згенерований HTML в картку піци
            pizzaCard.innerHTML = `
                <div class="pizza-image-container">
                    <img src="${pizza.image}" alt="Піца ${pizza.name}">
                    ${badgeHtml}
                </div>
                <div class="pizza-details">
                    <h2 class="pizza-name">${pizza.name}</h2>
                    <p class="pizza-type">${pizza.categories.join(', ')}</p> <p class="pizza-ingredients">${pizza.ingredients}</p>
                    <div class="pizza-purchase-options">
                        ${purchaseOptionsHtml}
                    </div>
                </div>
            `;
            pizzaList.appendChild(pizzaCard); //додаємо створену картку до списку піц на сторінці
        });

        //лісенери для кнопок "Купити"
        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', addToCart); //при кліку викликаємо функцію addToCart
        });
    }

    //для додавання піци до кошика
    function addToCart(event) {
        const button = event.target; //отримуємо кнопку на яку був клік
        //отримує дані про піцу з data-атрибутів кнопки
        const pizzaId = parseInt(button.dataset.pizzaId);
        const pizzaSize = parseInt(button.dataset.pizzaSize);
        const pizzaPrice = parseInt(button.dataset.pizzaPrice);
        const pizzaWeight = parseInt(button.dataset.pizzaWeight);
        //знаходимо повні дані піци з масиву allPizzas за її ID
        const pizza = allPizzas.find(p => p.id === pizzaId);
        if (!pizza) return; // якщо піцу не знайдено (хоча такого не має бути) то виходимо
        //перевірка чи не має такої самої піци у кошику (той самий ID, розмір)
        const existingItemIndex = cart.findIndex(item => item.id === pizzaId && item.size === pizzaSize);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity++; //якщо є то збільшуємо кількість
        } else {
            //інакше додаємо її як новий об'єкт
            cart.push({
                id: pizzaId,
                name: pizza.name,
                image: pizza.image,
                size: pizzaSize,
                weight: pizzaWeight,
                price: pizzaPrice,
                quantity: 1
            });
        }
        updateCart(); //оновлює відображення кошика
    }

    //для оновлення відображення кошика та збереження його в local storage
    function updateCart() {
        cartItemsList.innerHTML = ''; //очищаємо поточний вміст списку товарів у кошику
        let totalCartCount = 0; //початкова кількість товарів в кошику
        let totalCartPrice = 0; //початкова загальна сума замовлення
        if (cart.length === 0) {
            //повідомлення якщо кошик порожній
            cartItemsList.innerHTML = '<p class="empty-cart-message">Кошик порожній.</p>';
        } else {
            //для кожного товару в кошику створюємо та додаємо елемент списку
            cart.forEach(item => {
                const cartItemElement = document.createElement('li'); //створюємо новий HTML-елемент <li>
                cartItemElement.classList.add('cart-item'); //додаємо клас 'cart-item' для стилізації
                cartItemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-info">
                        <p class="item-name">${item.name} (${item.size === 30 ? 'Мала' : 'Велика'})</p>
                        <div class="item-specs">
                            <div class="spec-item">
                                <img src="images/size-icon.svg" alt="Діаметр" class="icon">
                                <span>${item.size}</span>
                            </div>
                            <div class="spec-item">
                                <img src="images/weight.svg" alt="Вага" class="icon">
                                <span>${item.weight}г</span>
                            </div>
                        </div>
                        <div class="item-controls-bottom">
                            <div class="quantity-control">
                                <button class="quantity-btn quantity-btn-minus" data-pizza-id="${item.id}" data-pizza-size="${item.size}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn quantity-btn-plus" data-pizza-id="${item.id}" data-pizza-size="${item.size}">+</button>
                            </div>
                            <div class="item-price">${item.price * item.quantity} грн</div>
                        </div>
                    </div>
                    <button class="remove-item" data-pizza-id="${item.id}" data-pizza-size="${item.size}">×</button>
                `;
                cartItemsList.appendChild(cartItemElement); //додаємо створений елемент до списку кошика
                totalCartCount += item.quantity; //оновлюємо загальну кількість товарів
                totalCartPrice += item.price * item.quantity; //оновлюємо загальну суму
            });
        }

        cartCountSpan.textContent = totalCartCount; //оновлюємо відображення загальної кількості товарів у кошику
        totalPriceSpan.textContent = `${totalCartPrice} грн`; //оновлюємо відображення загальної суми
        //зберігає стан кошика в JSON і записує в local storage
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
        //додає лісенери після оновлення кошика
        document.querySelectorAll('.quantity-btn-minus').forEach(button => {
            button.addEventListener('click', decreaseQuantity); // для кнопки зменшення кількості
        });
        document.querySelectorAll('.quantity-btn-plus').forEach(button => {
            button.addEventListener('click', increaseQuantity); // для кнопки збільшення кількості
        });
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeItemFromCart); // для кнопки видалення товару
        });
    }

    //для збільшення кількості конкретної піци в кошику
    function increaseQuantity(event) {
        const button = event.target; // кнопка на яку був клік
        //ID та розмір піци получаєм з data-атрибутів кнопки
        const pizzaId = parseInt(button.dataset.pizzaId);
        const pizzaSize = parseInt(button.dataset.pizzaSize);
        //працює по індексу елемента в масиві cart
        const itemIndex = cart.findIndex(item => item.id === pizzaId && item.size === pizzaSize);
        if (itemIndex > -1) {
            cart[itemIndex].quantity++; // збільшуємо кількість
            updateCart(); //оновлює відображення кошика
        }
    }

    //для зменшення кількості конкретної піци в кошику
    function decreaseQuantity(event) {
        const button = event.target; // кнопка на яку був клік
        //ID та розмір піци получаєм з data-атрибутів кнопки
        const pizzaId = parseInt(button.dataset.pizzaId);
        const pizzaSize = parseInt(button.dataset.pizzaSize);
        //працює по індексу елемента в масиві cart
        const itemIndex = cart.findIndex(item => item.id === pizzaId && item.size === pizzaSize);
        if (itemIndex > -1) {
            cart[itemIndex].quantity--; // зменшуємо кількість
            //якщо кількість 0 або менше видаляємо товар з кошика
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // видаляємо 1 елемент починаючи з itemIndex
            }
            updateCart(); //оновлює відображення кошика
        }
    }

    //видалення конкретної піци з кошика
    function removeItemFromCart(event) {
        const button = event.target; //кнопка на яку був клік
        //отримує ID та розмір піци з data-атрибутів кнопки
        const pizzaId = parseInt(button.dataset.pizzaId);
        const pizzaSize = parseInt(button.dataset.pizzaSize);
        //фільтрує масив cart, залишаючи лише ті елементи, які НЕ відповідають ID та розміру видаленої піци
        cart = cart.filter(item => !(item.id === pizzaId && item.size === pizzaSize));
        updateCart(); //оновлює відображення кошика
    }

    //лісенери для всіх фільтрів
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); //щоб не перезавантажувалось
            const filter = event.target.dataset.filter; //отримує значення фільтра з data-атрибуту
            filterButtons.forEach(btn => btn.classList.remove('active')); //робе всі кнопки не 'active'
            event.target.classList.add('active'); //додає 'active' до натиснутої кнопки
            displayPizzas(filter); //викликає функцію відображення піц з обраним фільтром
        });
    });
    //лісенер для кнопки "Очистити замовлення"
    clearCartButton.addEventListener('click', (event) => {
        event.preventDefault(); //треба щоб сторінка не перезавантажувалась кожного разу коли кошик очищаєм
        cart = []; //очищення
        updateCart(); //оновлює відображення кошика
    });
    loadPizzas(); //завантажує список піц
    updateCart(); //оновлює кошик (треба щоб відновлювався з local storage при перезавантаженні сторінки)
});