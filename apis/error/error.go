package error

import "net/http"

func ErrorHandler(w http.ResponseWriter, r *http.Request, errNum int) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	switch errNum {
	case 400:
		w.WriteHeader(http.StatusBadRequest)
	case 401:
		w.WriteHeader(http.StatusUnauthorized)
	case 403:
		w.WriteHeader(http.StatusForbidden)
	case 404:
		w.WriteHeader(http.StatusNotFound)
	case 405:
		w.WriteHeader(http.StatusMethodNotAllowed)
	default:
		w.WriteHeader(http.StatusInternalServerError)
	}
}
