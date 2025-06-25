fetch('./src/polls.json')
  .then(response => response.json())
  .then(data => {
    const reportData = [];

    data.forEach(poll => {
      poll.options.forEach(opt => {
        reportData.push({
          "Питання": poll.question,
          "Категорія": poll.category || "Без категорії",
          "Варіант": opt.text,
          "Відсоток": opt.percent,
          "Голосів (приблизно)": Math.round(poll.votes * (opt.percent / 100))
        });
      });
    });

    new WebDataRocks({
      container: "#wdr-component",
      toolbar: true,
      report: {
        dataSource: {
          data: reportData
        },
        slice: {
          rows: [
            { uniqueName: "Питання" },
            { uniqueName: "Варіант" }
          ],
          columns: [
            { uniqueName: "Категорія" }
          ],
          measures: [
            { uniqueName: "Відсоток", aggregation: "average" },
            { uniqueName: "Голосів (приблизно)", aggregation: "sum" }
          ]
        }
      }
    });
  });
