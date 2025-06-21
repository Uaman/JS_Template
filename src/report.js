// Імпортуємо дані з main.js (якщо потрібно, можна скопіювати pollsData сюди)
// Або підключити main.js перед report.js в HTML

// Функція для перетворення даних опитувань у формат для WebDataRocks
function transformPollsDataForWebDataRocks(pollsData) {
    const transformedData = [];

    pollsData.polls.forEach(poll => {
        poll.options.forEach(option => {
            transformedData.push({
                "Poll ID": poll.id,
                "Question": poll.question,
                "Category": poll.category,
                "Option": option.name,
                "Votes": option.votes,
                "Percentage": option.percentage,
                "Total Poll Votes": poll.totalVotes,
                "Option Rank": poll.options.indexOf(option) + 1,
                "Is Top Option": option.votes === Math.max(...poll.options.map(o => o.votes)) ? "Yes" : "No",
                "Vote Range": option.votes < 20 ? "Low (0-19)" :
                    option.votes < 50 ? "Medium (20-49)" :
                        option.votes < 100 ? "High (50-99)" : "Very High (100+)"
            });
        });
    });

    return transformedData;
}

// Дані для демонстрації (якщо pollsData недоступний)
const fallbackPollsData = {
    "polls": [
        {
            "id": 1,
            "question": "What is your favorite programming language?",
            "category": "Technology",
            "options": [
                {"name": "JavaScript", "votes": 68, "percentage": 45},
                {"name": "Python", "votes": 68, "percentage": 45},
                {"name": "Java", "votes": 53, "percentage": 35},
                {"name": "C++", "votes": 5, "percentage": 3}
            ],
            "totalVotes": 150
        },
        {
            "id": 2,
            "question": "Which social media platform do you use the most?",
            "category": "Social Media",
            "options": [
                {"name": "Facebook", "votes": 63, "percentage": 35},
                {"name": "Twitter", "votes": 45, "percentage": 25},
                {"name": "Instagram", "votes": 54, "percentage": 30},
                {"name": "LinkedIn", "votes": 18, "percentage": 10}
            ],
            "totalVotes": 180
        },
        {
            "id": 3,
            "question": "What's your preferred way to learn new skills?",
            "category": "Education",
            "options": [
                {"name": "Online courses", "votes": 85, "percentage": 42},
                {"name": "Books", "votes": 65, "percentage": 32},
                {"name": "YouTube videos", "votes": 40, "percentage": 20},
                {"name": "Workshops", "votes": 12, "percentage": 6}
            ],
            "totalVotes": 202
        },
        {
            "id": 4,
            "question": "Which streaming service do you use most?",
            "category": "Entertainment",
            "options": [
                {"name": "Netflix", "votes": 120, "percentage": 48},
                {"name": "Disney+", "votes": 65, "percentage": 26},
                {"name": "Amazon Prime", "votes": 40, "percentage": 16},
                {"name": "HBO Max", "votes": 25, "percentage": 10}
            ],
            "totalVotes": 250
        },
        {
            "id": 5,
            "question": "What's your favorite type of exercise?",
            "category": "Sports",
            "options": [
                {"name": "Running", "votes": 45, "percentage": 30},
                {"name": "Weight training", "votes": 60, "percentage": 40},
                {"name": "Yoga", "votes": 30, "percentage": 20},
                {"name": "Swimming", "votes": 15, "percentage": 10}
            ],
            "totalVotes": 150
        },
        {
            "id": 6,
            "question": "Which work style do you prefer?",
            "category": "Business",
            "options": [
                {"name": "Remote work", "votes": 140, "percentage": 56},
                {"name": "Office work", "votes": 60, "percentage": 24},
                {"name": "Hybrid", "votes": 50, "percentage": 20}
            ],
            "totalVotes": 250
        },
        {
            "id": 7,
            "question": "What's your favorite type of food?",
            "category": "Lifestyle",
            "options": [
                {"name": "Italian", "votes": 80, "percentage": 32},
                {"name": "Asian", "votes": 90, "percentage": 36},
                {"name": "Mexican", "votes": 50, "percentage": 20},
                {"name": "American", "votes": 30, "percentage": 12}
            ],
            "totalVotes": 250
        },
        {
            "id": 8,
            "question": "Which mobile operating system do you prefer?",
            "category": "Technology",
            "options": [
                {"name": "iOS", "votes": 95, "percentage": 48},
                {"name": "Android", "votes": 100, "percentage": 50},
                {"name": "Other", "votes": 5, "percentage": 2}
            ],
            "totalVotes": 200
        }
    ]
};

// Функція для завантаження даних з localStorage
function loadPollsDataFromStorage() {
    try {
        const savedData = localStorage.getItem('pollsAppData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log('Loaded polls data from localStorage for report');
            return parsedData;
        }
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
    }

    // Використовуємо fallback дані, якщо немає збережених
    console.log('Using fallback data for report');
    return typeof pollsData !== 'undefined' ? pollsData : fallbackPollsData;
}

// Глобальна змінна для pivot
let pivot;

// Ініціалізація WebDataRocks після завантаження сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Завантажуємо дані з localStorage
    const dataToUse = loadPollsDataFromStorage();

    // Перетворюємо дані для WebDataRocks
    const transformedData = transformPollsDataForWebDataRocks(dataToUse);

    console.log('Transformed data for WebDataRocks:', transformedData);

    // Ініціалізуємо WebDataRocks
    pivot = new WebDataRocks({
        container: "#wdr-component",
        toolbar: true,
        height: 600,
        report: {
            dataSource: {
                data: transformedData
            },
            slice: {
                rows: [
                    {
                        uniqueName: "Category",
                        caption: "Категорія"
                    },
                    {
                        uniqueName: "Question",
                        caption: "Питання"
                    }
                ],
                columns: [
                    {
                        uniqueName: "Option",
                        caption: "Варіант відповіді"
                    }
                ],
                measures: [
                    {
                        uniqueName: "Votes",
                        aggregation: "sum",
                        caption: "Кількість голосів"
                    },
                    {
                        uniqueName: "Percentage",
                        aggregation: "average",
                        caption: "Середній відсоток"
                    }
                ]
            },
            options: {
                grid: {
                    showGrandTotals: "on",
                    showTotals: "on"
                }
            },
            formats: [
                {
                    name: "percentage",
                    decimalPlaces: 1,
                    textAlign: "right"
                }
            ]
        },
        customizeCell: function(cell, data) {
            // Кастомізація клітинок (наприклад, кольорове кодування)
            if (data.isClassicTotalRow || data.isClassicTotalColumn || data.isGrandTotalRow || data.isGrandTotalColumn) {
                cell.style.backgroundColor = "#f5f5f5";
                cell.style.fontWeight = "bold";
            }

            // Виділення високих значень голосів
            if (data.measure && data.measure.uniqueName === "Votes" && data.value > 80) {
                cell.style.backgroundColor = "#e8f5e8";
                cell.style.color = "#2e7d32";
            }
        },
        reportcomplete: function() {
            console.log('WebDataRocks report completed successfully');

            // Додаємо кнопку для оновлення даних
            addRefreshButton();
        }
    });

    // Функція для додавання кнопки оновлення даних
    function addRefreshButton() {
        const toolbar = document.querySelector('.wdr-toolbar-wrapper');
        if (toolbar) {
            const refreshBtn = document.createElement('button');
            refreshBtn.innerHTML = '🔄 Оновити дані';
            refreshBtn.className = 'wdr-toolbar-button';
            refreshBtn.style.marginLeft = '10px';
            refreshBtn.style.padding = '5px 10px';
            refreshBtn.style.backgroundColor = '#4CAF50';
            refreshBtn.style.color = 'white';
            refreshBtn.style.border = 'none';
            refreshBtn.style.borderRadius = '4px';
            refreshBtn.style.cursor = 'pointer';

            refreshBtn.addEventListener('click', function() {
                console.log('Manual refresh triggered');
                window.updateReportData();
            });

            toolbar.appendChild(refreshBtn);
        }
    }

    // Глобально доступна функція для оновлення даних із зовнішнього коду
    window.updateReportData = function() {
        console.log('Updating report data from localStorage');
        const currentData = loadPollsDataFromStorage();
        const newTransformedData = transformPollsDataForWebDataRocks(currentData);

        if (pivot) {
            pivot.updateData({
                data: newTransformedData
            });
            console.log('Report data updated successfully');
        }
    };

    // Слухач для оновлень localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'pollsAppData' && e.newValue) {
            console.log('Detected localStorage update, refreshing report data');
            window.updateReportData();
        }
    });

    // Слухач для кастомної події з тієї ж вкладки
    window.addEventListener('pollsDataUpdated', function(e) {
        console.log('Detected polls data update event, refreshing report');
        window.updateReportData();
    });
});

// Функція для автоматичного оновлення даних кожні 30 секунд
function startAutoRefresh() {
    setInterval(function() {
        console.log('Auto-refreshing report data...');
        window.updateReportData();
    }, 30000); // Оновлення кожні 30 секунд
}

// Запустити автооновлення (можна закоментувати, якщо не потрібно)
// startAutoRefresh();

// Експортуємо функцію трансформації для використання в інших файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { transformPollsDataForWebDataRocks };
}