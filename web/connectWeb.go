package web

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"text/template"
)

type Page struct {
	Title string
}

func ConnectWeb(db *sql.DB) {
	// // Optionally clear all tables if needed
	// if err := clearAllTables(db); err != nil {
	// 	fmt.Println("Error clearing tables:", err)
	// 	return
	// }

	// Serve static files
	http.Handle("/web/", http.StripPrefix("/web/", http.FileServer(http.Dir("web/"))))
	http.Handle("/templates/", http.StripPrefix("/templates/", http.FileServer(http.Dir("templates/"))))
	http.Handle("/style/", http.StripPrefix("/style/", http.FileServer(http.Dir("style/"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("js/"))))

	// Define routes
	http.HandleFunc("/", mainPageHandler)

	fmt.Println("Listening on: http://localhost:8989/")
	if err := http.ListenAndServe("0.0.0.0:8989", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func mainPageHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path != "/" && path != "/logIn" && path != "/signup" && path != "/aboutUs" && path != "/createPost" && path != "/postsPage" {
		
		return
	}

	tmpl, err := template.ParseFiles("../templates/mainPage.html")
	if err != nil {
		log.Printf("Error parsing template: %v", err)
        http.Error(w, "Internal Server Error 1", http.StatusInternalServerError)
		return
	}
	data := Page{
		Title: "Hello",
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		log.Printf("Error parsing template: %v", err)
        http.Error(w, "Internal Server Error 2", http.StatusInternalServerError)
		return
	}

}
