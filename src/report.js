document.addEventListener('DOMContentLoaded', function() {

    const storedPolls = JSON.parse(localStorage.getItem('pollsData')) || [];

    const transformedData = [];
    storedPolls.forEach(poll => {
        poll.options.forEach(option => {
            transformedData.push({
                "Питання": poll.question,
                "Категорія": poll.category,
                "Варіант": option.name,
                "Голоси за варіант": option.votes,
                "Відсоток за варіант": option.percentage,
                "Всього голосів опитування": poll.totalVotes
            });
        });
    });

    // Ініціалізація WebDataRocks
    if (WebDataRocks) { // Перевіряємо, чи бібліотека завантажилась
        const pivot = new WebDataRocks({
            container: "#wdr-component",
            toolbar: true, // Дозволити панель інструментів
            report: {
                dataSource: transformedData,
                slice: {
                    rows: [
                        { uniqueName: "Категорія" },
                        { uniqueName: "Питання" },
                        { uniqueName: "Варіант" }
                    ],
                    columns: [
                        { uniqueName: "[Measures]" }
                    ],
                    measures: [
                        { uniqueName: "Голоси за варіант", aggregation: "sum" },
                        { uniqueName: "Відсоток за варіант", aggregation: "average" }, // або sum, якщо відсотки вже в сумі
                        { uniqueName: "Всього голосів опитування", aggregation: "sum" }
                    ]
                },
                options: {
                    // Додаткові опції звіту, наприклад:
                    grid: {
                        showGrandTotals: "on", // Показати загальні підсумки
                        showColumnGrandTotals: false // Можна вимкнути для колонок, якщо не потрібно
                    }
                }
            }
        });
    } else {
        console.error("WebDataRocks не завантажено.");
    }
});