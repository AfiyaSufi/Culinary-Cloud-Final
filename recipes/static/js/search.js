document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("searchForm");
    const searchResultsSection = document.getElementById("searchResults");
    const searchResultsContainer = document.getElementById("searchResultsContainer");
  
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const query = document.getElementById("searchQuery").value.trim();
        const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
  
        if (!query) {
          alert("Please enter a search query.");
          return;
        }
  
        console.log("Submitting search query:", query);
  
        fetch("/search/api/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ query: query }),
        })
          .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })
          .then(data => {
            console.log("Search results:", data);
            if (data.error) {
              alert("Error: " + data.error);
              return;
            }
  
            // Clear previous results
            searchResultsContainer.innerHTML = "";
            const results = data.results;
  
            if (results.length === 0) {
              searchResultsContainer.innerHTML = "<p>No recipes found.</p>";
              searchResultsSection.style.display = "block";
              return;
            }
  
            // Display results in carousels (rows of 4)
            results.forEach(chunk => {
              const row = document.createElement("div");
              row.className = "row";
              chunk.forEach(recipe => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                  <img src="${recipe.recipe_image || '/static/images/cardImg1.jpg'}" alt="${recipe.recipe_name}" />
                  <div class="name">
                    <h3>${recipe.recipe_name}</h3>
                  </div>
                  <div class="ratings">
                    <img src="/static/images/star.png" />
                    <p>${recipe.average_rating.toFixed(1)} (${recipe.ratings_count} Reviews)</p>
                  </div>
                  <a href="/recipe/${recipe.id}/" class="view-button">View Recipe</a>
                `;
                row.appendChild(card);
              });
              searchResultsContainer.appendChild(row);
            });
  
            searchResultsSection.style.display = "block";
          })
          .catch(error => {
            console.error("Error during search:", error);
            alert("Error during search: " + error);
          });
      });
    }
  });