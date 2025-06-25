document.addEventListener('DOMContentLoaded', async () => {
  try {
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.textContent = 'Завантаження даних...';
    
    const response = await fetch('../data/books.json');
    
    if (!response.ok) {
      throw new Error(`Помилка завантаження: ${response.status}`);
    }
    
    const books = await response.json();

    const reportData = books.map(book => ({
      Назва: book.title,
      Автор: book.author,
      Рік: book.year,
      Жанр: book.genre,
      Мова: book.language,
      Зображення: book.image
    }));
    
    new WebDataRocks({
      container: "#wdr-component",
      toolbar: true,
      report: {
        dataSource: {
          data: reportData,
          dataSourceType: 'json'
        },
        slice: {
          rows: [
            { uniqueName: "Назва" },
            { uniqueName: "Автор" },
            { uniqueName: "Рік" },
            { uniqueName: "Жанр" },
            { uniqueName: "Мова" },
            { uniqueName: "Зображення" }
          ],
          measures: [
            { 
              uniqueName: "Назва", 
              aggregation: "count",
              caption: "Назва"
            }
          ]
        },
        options: {
          grid: {
            type: "flat",
            showTotals: "off",
            showGrandTotals: "off"
          }
        }
      },
      global: {
        localization: "https://cdn.webdatarocks.com/loc/uk.json"
      }
    });
    
    loadingMessage.style.display = 'none';
    
  } catch (error) {
    console.error('Помилка:', error);
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.innerHTML = `
      <div class="error-message">
        <p>Помилка при завантаженні аналітики: ${error.message}</p>
        <a href="index.html" class="back-btn">← Назад до бібліотеки</a>
      </div>
    `;
    loadingMessage.classList.add('error-message');
  }
});