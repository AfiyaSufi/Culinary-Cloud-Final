window.onload = function () {
  const log = document.getElementById("logIn");
  const sign = document.getElementById("signUp");
  const content = document.querySelector(".content");

  function signUp() {
    log.classList.remove("active");
    sign.classList.add("active");
    content.innerHTML = `
        <form method="post" action="${SIGNUP_URL}">
        <input type="hidden" name="csrfmiddlewaretoken" value="${CSRF_TOKEN}">
          <div class="divs">
            <label for="name">NAME</label>
            <input class="fields" type="text" name="name" required />
          </div>
          <div class="divs">
            <label for="email">EMAIL</label>
            <input class="fields" type="email" name="email" required />
          </div>
          <div class="divs">
            <label for="password">PASSWORD</label>
            <input class="fields" type="password" name="password" required />
          </div>
          <input class="submit signup" type="submit" value="SIGN UP" />
        </form>
      `;
  }

  function logIn() {
    log.classList.add("active");
    sign.classList.remove("active");
    content.innerHTML = `
        <form method="post" action="${LOGIN_URL}">
        <input type="hidden" name="csrfmiddlewaretoken" value="${CSRF_TOKEN}">
          <div class="divs">
            <label for="email">EMAIL</label>
            <input class="fields" type="email" name="email" required />
          </div>
          <div class="divs">
            <label for="password">PASSWORD</label>
            <input class="fields" type="password" name="password" required />
          </div>
          <input class="submit login" type="submit" value="SIGN IN" />
        </form>
      `;
  }

  document.getElementById("signUp").onclick = signUp;
  document.getElementById("logIn").onclick = logIn;
};
