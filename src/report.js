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
                "Total Poll Votes": poll.totalVotes
            });
        });
    });

    return transformedData;
}

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

    console.log('Using fallback data for report');
    return typeof pollsData !== 'undefined' ? pollsData : fallbackPollsData;
}

let pivot;

document.addEventListener('DOMContentLoaded', function() {
    const dataToUse = loadPollsDataFromStorage();
    const transformedData = transformPollsDataForWebDataRocks(dataToUse);

    console.log('Transformed data for WebDataRocks:', transformedData);

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
                        caption: "Category"
                    },
                    {
                        uniqueName: "Question",
                        caption: "Question"
                    }
                ],
                columns: [
                    {
                        uniqueName: "Option",
                        caption: "Option"
                    }
                ],
                measures: [
                    {
                        uniqueName: "Votes",
                        aggregation: "sum",
                        caption: "Votes"
                    },
                    {
                        uniqueName: "Percentage",
                        aggregation: "average",
                        caption: "Percentage"
                    }
                ]
            },
            options: {
                grid: {
                    showGrandTotals: "on",
                    showTotals: "on"
                }
            }
        },
        customizeCell: function(cell, data) {
            if (data.isClassicTotalRow || data.isClassicTotalColumn || data.isGrandTotalRow || data.isGrandTotalColumn) {
                cell.style.backgroundColor = "#f5f5f5";
                cell.style.fontWeight = "bold";
            }
            if (data.measure && data.measure.uniqueName === "Votes" && data.value > 80) {
                cell.style.backgroundColor = "#e8f5e8";
                cell.style.color = "#2e7d32";
            }
        },
        reportcomplete: function() {
            console.log('WebDataRocks report completed successfully');
            addRefreshButton();
        }
    });

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

    window.addEventListener('storage', function(e) {
        if (e.key === 'pollsAppData' && e.newValue) {
            console.log('Detected localStorage update, refreshing report data');
            window.updateReportData();
        }
    });

    window.addEventListener('pollsDataUpdated', function(e) {
        console.log('Detected polls data update event, refreshing report');
        window.updateReportData();
    });
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { transformPollsDataForWebDataRocks };
}