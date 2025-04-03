package error

import (
	"net/http"
)

func ErrorPage(w http.ResponseWriter, r *http.Request, errCode string) {
	w.Header().Set("Content-Type", "text/html")

	var message string
	switch errCode {
	case "400":
		w.WriteHeader(http.StatusBadRequest)
		message = "Bad Request: Your request is invalid."
	case "404":
		w.WriteHeader(http.StatusNotFound)
		message = "Not Found: The page you are looking for does not exist."
	case "500":
		w.WriteHeader(http.StatusInternalServerError)
		message = "Internal Server Error: There was an internal server error."
	default:
		w.WriteHeader(http.StatusNotFound)
		message = "Not Found: Page not found."
	}

	// Create a simple HTML response
	htmlResponse := `
	<!DOCTYPE html>
	<html lang="en">
	<head>
	    <meta charset="UTF-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" type="text/css" href="../style/style.css">
	    <title>Error</title>
	</head>
	<body>
	<section id="errorSection">
        <div class="container-error">
            <div id="errorContainer">
				<h1>Error ` + errCode + `</h1>
				<p>` + message + `</p>
				<a href="/">Go back to home page</a>
			</div>
        </div>
    </section>
	    
	</body>
	</html>
	`

	w.Write([]byte(htmlResponse))
}
