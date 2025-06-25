document.addEventListener('DOMContentLoaded', () => {
    //асинхронне завантаження даних про піцу з файлу pizzas.json
    async function loadPizzaData() {
        try {
            //HTTP-запит
            const response = await fetch('pizzas.json');
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            //парсимо відповідь у форматі JSON та повертаємо її
            return await response.json();
        } catch (error) {
            //якщо сталася помилка під час завантаження або парсингу, виводимо її в консоль
            console.error('не вдалось завантажити дані:', error);
            //повертаємо порожній масив, щоб уникнути подальших помилок у логіці
            return [];
        }
    }

    //WebDataRocks
    loadPizzaData().then(pizzaData => {
        // перетворюємо завантажені дані у "пласку" структуру, більш зручну для WebDataRocks
        const transformedData = [];
        //перебираємо кожну піцу в оригінальному масиві даних
        pizzaData.forEach(pizza => {
            //для кожної піци перебираємо її варіанти цін (розмірів)
            pizza.prices.forEach(priceOption => {
                //додаємо новий об'єкт в масив з вирівняними полями
                transformedData.push({
                    "Назва Піци": pizza.name,
                    "Категорії": pizza.categories.join(', '),
                    "Інгредієнти": pizza.ingredients,
                    "Розмір (см)": priceOption.size,
                    "Вага (г)": priceOption.weight,
                    "Ціна (грн)": priceOption.price,
                    "Нова": pizza.isNew ? "Так" : "Ні",
                    "Популярна": pizza.isPopular ? "Так" : "Ні"
                });
            });
        });

        //конфіг WebDataRocks
        const pivot = new WebDataRocks({
            container: "#wdr-component", //елемент у якому відображено зведену таблицю
            toolbar: true, //панель інструментів WebDataRocks для інтерактивності
            report: { //об'єкт, що визначає структуру та налаштування звіту
                dataSource: {
                    data: transformedData // дані, які будуть використовуватися для побудови звіту
                },
                slice: { // визначає, як поля даних розподіляються по рядках, стовпцях та фільтрах
                    rows: [
                        { uniqueName: "Назва Піци" }
                    ],
                    columns: [
                        { uniqueName: "Розмір (см)" },
                        { uniqueName: "Інгредієнти" },
                        { uniqueName: "Категорії" },
                        { uniqueName: "Нова"},
                        { uniqueName: "Популярна"},
                        { uniqueName: "[Measures]" } // спеціальне поле для відображення агрегованих значень (метрик)
                    ],
                    measures: [ // поля, для яких будуть обчислюватися агреговані значення
                        { uniqueName: "Ціна (грн)", aggregation: "average", caption: "Середня Ціна" }, // середня ціна
                        { uniqueName: "Вага (г)", aggregation: "average", caption: "Середня Вага" } // середня вага
                    ]
                },
                options: {
                    grid: {
                        type: "flat" // відображати дані у форматі "плоскої" таблиці (без ієрархії згортання/розгортання)
                    }
                }
            }
        });
    });
});
