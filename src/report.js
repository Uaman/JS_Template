document.addEventListener('DOMContentLoaded', async () => {
    let pollsData = JSON.parse(localStorage.getItem('polls')) || [];
    
    if (pollsData.length === 0) {
        try {
            const response = await fetch('data/polls.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            pollsData = await response.json();
            localStorage.setItem('polls', JSON.stringify(pollsData));
        } catch (error) {
            alert('Не вдалося завантажити дані для аналітики: ' + error.message);
            return;
        }
    }
    
    const reportData = [];
    
    pollsData.forEach(poll => {
        poll.options.forEach(option => {
            const percent = poll.totalVotes > 0 
                ? Math.round((option.votes / poll.totalVotes) * 100) 
                : 0;
                
            reportData.push({
                "ID опитування": poll.id,
                "Питання": poll.question,
                "Категорія": poll.category,
                "Варіант": option.text,
                "Кількість голосів": option.votes,
                "Відсоток": percent,
                "Загальна кількість голосів": poll.totalVotes
            });
        });
    });
    
    try {
        const report = {
            dataSource: {
                data: reportData
            },
            options: {
                grid: {
                    type: "flat",
                    showTotals: "on",
                    showGrandTotals: "on"
                },
                configuratorActive: true
            },
            slice: {
                rows: [
                    { uniqueName: "Категорія" },
                    { uniqueName: "Питання" },
                    { uniqueName: "Варіант" }
                ],
                columns: [
                    { uniqueName: "Measures" }
                ],
                measures: [
                    { uniqueName: "Кількість голосів", aggregation: "sum" },
                    { uniqueName: "Відсоток", aggregation: "average" }
                ]
            },
            formats: [
                {
                    name: "Кількість голосів",
                    decimalPlaces: 0
                },
                {
                    name: "Відсоток",
                    decimalPlaces: 1,
                    maxDecimalPlaces: 1
                }
            ]
        };
        
        new WebDataRocks({
            container: "#wdr-component",
            toolbar: true,
            report: report
        });
        
    } catch (e) {
        alert("Помилка ініціалізації звіту: " + e.message);
    }
});