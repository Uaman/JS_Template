    document.addEventListener('DOMContentLoaded', function() {
                const backup = localStorage.getItem('pollsBackup');
                let polls = [];
                
                if (backup) {
                    try {
                        const data = JSON.parse(backup);
                        polls = data.polls || [];
                    } catch (e) {
                        console.error('Помилка парсингу резервної копії:', e);
                    }
                }
                
                const reportData = [];
                
                polls.forEach(poll => {
                    poll.options.forEach(option => {
                        reportData.push({
                            "Питання": poll.question,
                            "Категорія": poll.category,
                            "Варіант": option.text,
                            "Кількість голосів": option.votes,
                            "Загальна кількість голосів": poll.totalVotes,
                            "Відсоток": poll.totalVotes > 0 
                                ? (option.votes / poll.totalVotes * 100).toFixed(1) 
                                : 0
                        });
                    });
                });
                
                const pivot = new WebDataRocks({
                    container: "#pivot-container",
                    toolbar: true,
                    report: {
                        dataSource: {
                            data: reportData
                        },
                        "slice": {
                            "rows": [{
                                "uniqueName": "Категорія"
                            }, {
                                "uniqueName": "Питання"
                            }, {
                                "uniqueName": "Варіант"
                            }],
                            "measures": [{
                                "uniqueName": "Кількість голосів",
                                "aggregation": "sum",
                                "format": "number"
                            }, {
                                "uniqueName": "Відсоток",
                                "aggregation": "average",
                                "format": "percent"
                            }]
                        },
                        "options": {
                            "grid": {
                                "type": "flat",
                                "showTotals": "off",
                                "showGrandTotals": "off"
                            }
                        },
                        "formats": [{
                            "name": "percent",
                            "decimalPlaces": 1,
                            "maxSymbols": 20,
                            "textAlign": "right"
                        }]
                    }
                });
            });