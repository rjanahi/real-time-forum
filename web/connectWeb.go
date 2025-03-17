package web

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"forum/apis/like"
	likerepo "forum/apis/like/repo"
	p "forum/apis/post"
	u "forum/apis/user"
	"forum/database"
	"log"
	"net/http"
	"strconv"
	"text/template"
	"time"
)

type Page struct {
	Title string
}

func isAuthenticated(db *sql.DB, r *http.Request) bool {
    userID, loggedIn := u.ValidateSession(db, r)
    return loggedIn && userID > 0
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

	// Define a handler for all paths (main page and dynamic routes)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		mainPageHandler(w, r, db)
	})

	http.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			// Serve the signup page
			http.ServeFile(w, r, "templates/signup.html") // Ensure you have a signup.html page
			return
		}
	
		if r.Method == http.MethodPost {
			u.Register(db, w, r) // Call the user registration function
			return
		}
	
		// If the request method is not GET or POST, return an error
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		u.Login(db, w, r) // Call the Login function from Register.go
	})

	http.HandleFunc("/get-posts", func(w http.ResponseWriter, r *http.Request) {
		p.GetPosts(db, w, r)
	})

	http.HandleFunc("/get-myPosts", func(w http.ResponseWriter, r *http.Request) {
		userID, loggedIn := u.ValidateSession(db, r)
		if !loggedIn {
			http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
			return
		}

		posts, err := database.GetPostsByUserID(db, userID)
		if err != nil {
			http.Error(w, "Failed to retrieve posts", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	})

	http.HandleFunc("/posts", func(w http.ResponseWriter, r *http.Request) {
		if !isAuthenticated(db, r) {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}
		mainPageHandler(w, r, db) //  This serves the Create Post page
	})

	http.HandleFunc("/create-post", func(w http.ResponseWriter, r *http.Request) {
		if !isAuthenticated(db, r) {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}
		p.CreatePost(db, w, r) //  This is the API to save posts
	})

	// likes
	likesRepo := likerepo.NewLikesRepository(db)
	likesService := like.NewLikesService(likesRepo)
	likesController := like.NewLikesController(*likesService)
	http.HandleFunc("/likeDislikePost", func(w http.ResponseWriter, r *http.Request) {
		likesController.LikeDislikePost(w, r, db)
	})
	http.HandleFunc("/likeDislikeComment", func(w http.ResponseWriter, r *http.Request) {
		likesController.InteractWithComment(w, r, db)
	})
	http.HandleFunc("/getInteractions", likesController.GetInteractions)

	http.HandleFunc("/comments", func(w http.ResponseWriter, r *http.Request) {
		postIDStr := r.URL.Query().Get("post_id")
		postID, err := strconv.Atoi(postIDStr)
		if err != nil || postID <= 0 {
			http.Error(w, "Invalid post ID", http.StatusBadRequest)
			return
		}

		// Fetch post details
		post, err := database.GetPostByPostID(db, postID)
		if err != nil || len(post) == 0 {
			http.Error(w, "Post not found", http.StatusNotFound)
			return
		}

		// Fetch comments
		comments, err := p.GetCommentsByPostID(db, postID)
		if err != nil {
			http.Error(w, "Error fetching comments", http.StatusInternalServerError)
			return
		}

		// Combine post and comments into a single response
		response := map[string]interface{}{
			"post":     post[0], // Assuming GetPostByPostID returns a slice
			"comments": comments,
		}

		// Return combined response as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	http.HandleFunc("/create-comment", func(w http.ResponseWriter, r *http.Request) {
		p.CreateComment(db, w, r) // Ensure this handles comment creation
	})

	http.HandleFunc("/category/", func(w http.ResponseWriter, r *http.Request) {
		category := strings.TrimPrefix(r.URL.Path, "/category/")
		fmt.Println(category)
		p.GetPostbyCategory(db, w, r, category)
	})

	http.HandleFunc("/check-session", func(w http.ResponseWriter, r *http.Request) {
		userID, loggedIn := u.ValidateSession(db, r)
		response := map[string]interface{}{
			"loggedIn": loggedIn,
			"userID":   userID,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	http.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		// Clear the session token cookie
		cookie := &http.Cookie{
			Name:     "session_token",
			Value:    "",
			Expires:  time.Now().Add(-1 * time.Hour), // Expire immediately
			HttpOnly: true,
			Path:     "/",
		}
		http.SetCookie(w, cookie)

		// Invalidate session in the database (optional but recommended)
		cookie, err := r.Cookie("session_token")
		cookieINT, _ := strconv.Atoi(cookie.Value)
		if err == nil {
			// Call a function to delete the session from the database
			err := database.DeleteSession(db, cookieINT)
			if err != nil {
				fmt.Println(" Error deleting session:", err)
			}
		}

		response := map[string]string{"message": "Logged out successfully"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	fmt.Println("Listening on: http://localhost:8888/")
	if err := http.ListenAndServe("0.0.0.0:8888", nil); err != nil {
		fmt.Println("Error starting server:", err)
	}
}

func mainPageHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// Serve the main page for all paths
	tmpl, err := template.ParseFiles("templates/mainPage.html")
	if err != nil {
		log.Printf("Error parsing template: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Pass data to the template if needed
	data := Page{
		Title: "Hello",
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		log.Printf("Error executing template: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
}

func clearAllTables(db *sql.DB) error {
	tables, err := getTableNames(db)
	if err != nil {
		return err
	}

	for _, table := range tables {
		query := `DELETE FROM ` + table
		_, err := db.Exec(query)
		if err != nil {
			return err
		}
	}

	return nil
}

func getTableNames(db *sql.DB) ([]string, error) {
	query := `SELECT name FROM sqlite_master WHERE type='table'`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, err
		}
		tables = append(tables, tableName)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	fmt.Println(tables)

	return tables, nil
}
