document.addEventListener("DOMContentLoaded", () => {
    fetch("./books.json")
        .then((response) => response.json)
        .then(books => {
            console.log(books)
        })



});