package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "modernc.org/sqlite"
)

func GetAllUserNames(db *sql.DB) ([]string, error) {
	// Define the SQL query to select all rows from the users table
	query := `SELECT username FROM users`

	// Execute the query
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close() // Ensure rows are closed after processing

	// Slice to hold the results
	var usernames []string
	for rows.Next() {
		var username string
		if err := rows.Scan(&username); err != nil {
			return nil, err
		}
		usernames = append(usernames, username)
	}
	return usernames, nil
}

func GetAllUserEmails(db *sql.DB) ([]string, error) {
	// Define the SQL query to select all rows from the users table
	query := `SELECT email FROM users`

	// Execute the query
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close() // Ensure rows are closed after processing

	// Slice to hold the results
	var emails []string
	for rows.Next() {
		var email string
		if err := rows.Scan(&email); err != nil {
			return nil, err
		}
		emails = append(emails, email)
	}
	return emails, nil
}

func GetUserID(db *sql.DB, username string) (int, error) {
	query := `SELECT id FROM users WHERE username = ?`
	var id int
	err := db.QueryRow(query, username).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			// No rows found for the given username
			return -1, nil
		}
		return -1, err
	}
	return id, nil
}

func GetUsernameUsingID(db *sql.DB, id int) (string, error) {
	query := `SELECT username FROM users WHERE id = ?`
	var username string
	err := db.QueryRow(query, id).Scan(&username)
	if err != nil {
		if err == sql.ErrNoRows {
			// No rows found for the given username
			return "", nil
		}
		return "", err
	}
	return username, nil
}

func GetPostIDbyUserID(db *sql.DB, userID int) (int, error) {
	query := `SELECT id FROM posts WHERE user_id = ?`
	var id int
	err := db.QueryRow(query, userID).Scan(id)
	if err != nil {
		if err == sql.ErrNoRows {
			// No rows found for the given username
			return -1, nil
		}
		return -1, err
	}
	return id, nil
}

func GetActiveSessionbyUserID(db *sql.DB, userID int) (int, error) {
	query := `SELECT id FROM sessions WHERE user_id = ? AND expires_at > ?`
	var id int
	currentTime := time.Now().UTC()
	err := db.QueryRow(query, userID, currentTime).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return -1, nil // No active session
		}
		return -1, err
	}
	return id, nil // Active session exists
}

func GetCategoriesByPostID(db *sql.DB, postID int) ([]string, error) {
	query := `SELECT categories.name FROM categories 
              JOIN post_categories ON categories.id = post_categories.category_id 
              WHERE post_categories.post_id = ?`

	rows, err := db.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var categoryName string
		if err := rows.Scan(&categoryName); err != nil {
			return nil, err
		}
		categories = append(categories, categoryName)
	}

	return categories, nil
}

func GetPostByPostID(db *sql.DB, postID int) ([]map[string]interface{}, error) {
	query := `
	SELECT p.id, u.username, p.title, p.content, p.created_at 
	FROM posts p
	JOIN users u ON p.user_id = u.id 
	WHERE p.id = ?`

	rows, err := db.Query(query, postID)
	if err != nil {
		fmt.Println("❌ Error retrieving posts:", err)
		return nil, err
	}
	defer rows.Close()
	var posts []map[string]interface{}
	for rows.Next() {
		var postID int
		var username, title, content string
		var createdAt time.Time

		err := rows.Scan(&postID, &username, &title, &content, &createdAt)
		if err != nil {
			fmt.Println("❌ Error scanning post:", err)
			return nil, err
		}

		// Fetch categories for this post
		categories, err := GetCategoriesByPostID(db, postID)
		if err != nil {
			fmt.Println("❌ Error retrieving categories for post:", err)
			return nil, err
		}

		// Store post in slice
		post := map[string]interface{}{
			"id":         postID,
			"username":   username,
			"title":      title,
			"content":    content,
			"categories": categories, // ✅ Include categories
			"createdAt":  createdAt.Format("2006-01-02 15:04:05"),
		}
		posts = append(posts, post)
	}
	return posts, nil
}
