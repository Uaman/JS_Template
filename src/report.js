fetch("./tasks.json")
  .then((res) => res.json())
  .then((data) => {
   new WebDataRocks({
      container: "#pivot-container",
      height: 430,
      toolbar: true,
      report: {
        dataSource: {
          data: data,
        },
        slice: {
          rows: [{ uniqueName: "priority" }],
          columns: [{ uniqueName: "completed" }],
          measures: [{ uniqueName: "title", aggregation: "count" }],
        },
      },
    });
  })
  .catch((err) => {
    alert("Помилка завантаження JSON: " + err.message);
    console.log(err);
  });
