document.addEventListener('DOMContentLoaded', function() {
    fetch('task.json')
        .then(response => {
            if (!response.ok) throw new Error('Помилка завантаження даних');
            return response.json();
        })
        .then(tasks => {
            if (!tasks || tasks.length === 0) throw new Error('Немає даних для аналітики');
            
            const report = {
                dataSource: {
                    data: tasks.map(task => ({
                        "Завдання": task.title,
                        "Дата": task.date,
                        "Пріоритет": task.priority,
                        "Статус": task.completed ? "Виконано" : "Не виконано"
                    }))
                },
                slice: {
                    rows: [
                        { uniqueName: "Статус" },
                        { uniqueName: "Пріоритет" }
                    ],
                    columns: [
                        { uniqueName: "Measures" }
                    ],
                    measures: [
                        { uniqueName: "Завдання", aggregation: "count" }
                    ]
                },
                options: {
                    grid: {
                        type: "flat",
                        showTotals: "off"
                    }
                }
            };

            new WebDataRocks({
                container: "#wdr-component",
                toolbar: true,
                report: report
            });
        })
        .catch(error => {
            console.error(error);
            document.getElementById('wdr-component').innerHTML = `
                <div class="error">
                    <p>${error.message}</p>
                    <p>Перевірте вміст файлу task.json</p>
                </div>
            `;
        });
});