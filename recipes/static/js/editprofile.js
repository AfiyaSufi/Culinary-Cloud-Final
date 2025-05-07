document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tabs .tab");
  const infoDiv = document.querySelector(".info");

  const defaultContent = `
        <h3 class="profile-name">${USER_DATA.name}</h3>
        <p class="profile-bio">${USER_DATA.bio || "No bio provided."}</p>
      `;

  const secondTabContent = `
        <h3 class="profile-name">${USER_DATA.name}</h3>
        <p class="profile-email"><strong>Email: </strong>${USER_DATA.email}</p>
        <p class="profile-occupation"><strong>Occupation: </strong>${USER_DATA.occupation || "Not specified"}</p>
        <p class="profile-hobbies"><strong>Hobbies: </strong>${USER_DATA.hobby || "Not specified"}</p>
      `;

  const thirdTabContent = `
        <h3 class="profile-name">${USER_DATA.name}</h3>
        <p class="profile-location"><strong>Location: </strong>${USER_DATA.location || "Not specified"}</p>
        <p class="profile-joined"><strong>Joined: </strong>${USER_DATA.date_joined}</p>
        <p class="profile-categories"><strong>Categories: </strong>${USER_DATA.categories || "Not specified"}</p>
      `;

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("active")) return;

      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      infoDiv.classList.add("fade");

      setTimeout(() => {
        if (index === 0) {
          infoDiv.innerHTML = defaultContent;
        } else if (index === 1) {
          infoDiv.innerHTML = secondTabContent;
        } else if (index === 2) {
          infoDiv.innerHTML = thirdTabContent;
        }

        infoDiv.classList.remove("fade");
      }, 300);
    });
  });

  tabs[0].classList.add("active");
  infoDiv.innerHTML = defaultContent; // Set default content on load
});