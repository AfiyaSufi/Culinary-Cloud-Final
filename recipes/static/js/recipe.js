document.addEventListener("DOMContentLoaded", function () {
  var list = document.getElementById("ingredients");
  list.addEventListener("click", function (ev) {
    if (ev.target.tagName === "LI") {
      ev.target.classList.toggle("checked");
    }
  });

  // Rating submission
  const ratingForm = document.getElementById("ratingForm");
  if (ratingForm) {
    ratingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const rating = document.getElementById("rating").value;
      const recipeId = window.recipeId;
      const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
      console.log("Submitting rating:", { recipe_id: recipeId, rating: rating, csrfToken: csrfToken });

      fetch("/recipe/rate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          recipe_id: recipeId,
          rating: rating,
        }),
      })
        .then(response => {
          console.log("Response status:", response.status);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log("Response data:", data);
          if (data.message) {
            alert("Rating submitted successfully!");
            location.reload();
          } else if (data.error) {
            alert("Error: " + data.error);
          }
        })
        .catch(error => {
          console.error("Error submitting rating:", error);
          alert("Error submitting rating: " + error);
        });
    });
  }

  // Comment submission
  const commentForm = document.getElementById("commentForm");
  if (commentForm) {
    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const commentText = document.getElementById("comment").value;
      const recipeId = window.recipeId;
      const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
      console.log("Submitting comment:", { recipe_id: recipeId, comment: commentText, csrfToken: csrfToken });

      fetch("/recipe/comment/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          recipe_id: recipeId,
          comment: commentText,
        }),
      })
        .then(response => {
          console.log("Response status:", response.status);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log("Response data:", data);
          if (data.message) {
            alert("Comment submitted successfully!");
            document.getElementById("comment").value = "";
            location.reload();
          } else if (data.error) {
            alert("Error: " + data.error);
          }
        })
        .catch(error => {
          console.error("Error submitting comment:", error);
          alert("Error submitting comment: " + error);
        });
    });
  }
});