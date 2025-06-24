const pollsData = localStorage.getItem('pollData');
const parsedData = pollsData ? JSON.parse(pollsData) : [];

const data = parsedData.flatMap(poll =>
    Object.entries(poll.options).map(([option, votes]) => ({
        Question: poll.question,
        Category: poll.category,
        Option: option,
        Votes: votes
    }))
);

new WebDataRocks({
container: "#pivotContainer",
toolbar: true,
height: 400,
    report: {
        dataSource: {
        data: data
        },
        showGrandTotalsRows: false,
        slice: {
            rows: [{ uniqueName: "Question" }],
            columns: [{ uniqueName: "Category" }],
            measures: [{ uniqueName: "Votes", aggregation: "sum" }]
        }
        
        
    }

});