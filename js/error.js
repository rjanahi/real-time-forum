
function errorPage(errNum, error) {
  const errorSection = document.getElementById("errorSection");
  const errorContainer = document.getElementById("errorContainer");
  const show = document.getElementById('show');
  fetch("/error/" + errNum, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      return res.text();
    })
    .then((html) => {
      console.log(html);
      show.hidden = true;
      // Show the error section based on the error number
      switch (errNum) {
        case 400:
          showSection(errorSection, "/error/400");
          errorContainer.innerHTML =
            "<h1>400 Bad Request</h1><p>Your request could not be understood.</p>";
          console.log(error)
          break;
        case 404:
          showSection(errorSection, "/error/404");
          errorContainer.innerHTML =
            "<h1>404 Not Found</h1><p>The resource you are looking for could not be found.</p>";
            console.log(error)
          break;
        case 500:
          showSection(errorSection, "/error/500");
          errorContainer.innerHTML =
            "<h1>500 Internal Server Error</h1><p>Something went wrong.</p>";
            console.log(error)
          break;
          case 405:
            showSection(mainSection, "/");
            break;
        default:
          showSection(errorSection, "/error/404");
          errorContainer.innerHTML =
            "<h1>404 Not Found</h1><p>The resource you are looking for could not be found.</p>";
            console.log(error)
          break;
      }
    })
    .catch((err) => {
      console.error("Failed to fetch error details:", err);
    });
}

window.errorPage = errorPage;
