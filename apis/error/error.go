package error

import "net/http"

func ErrorHandler(w http.ResponseWriter, r *http.Request, errNum int) {
	w.Header().Set("Content-Type", "text/html")

	switch errNum {
	case 400:
		w.WriteHeader(http.StatusBadRequest) // 400 Bad Request
		w.Write([]byte("<h1>400 Bad Request</h1><p>Your request could not be understood.</p>"))

	case 404:
		w.WriteHeader(http.StatusNotFound) // 404 Not Found
		w.Write([]byte("<h1>404 Not Found</h1><p>The resource you are looking for could not be found.</p>"))

	case 500:
		w.WriteHeader(http.StatusInternalServerError) // 500 Internal Server Error
		w.Write([]byte("<h1>500 Internal Server Error</h1><p>Something went wrong on our end.</p>"))

	default:
		w.WriteHeader(http.StatusInternalServerError) // Default to 500 for unknown errors
		w.Write([]byte("<h1>500 Internal Server Error</h1><p>Something went wrong.</p>"))
	}
}
