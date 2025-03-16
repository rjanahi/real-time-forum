package post

import (
	"database/sql"
	"encoding/json"
	"fmt"
	database "forum/database"
	"net/http"
)

func GetPostbyCategory(db *sql.DB, w http.ResponseWriter, r *http.Request, category string) {
	// Fetch the category ID based on the category name
	categoryID, err := database.GetCategoryIDByName(db, category)
	if err != nil {
		fmt.Println("❌ Error retrieving category ID:", err)
		categoryID, _ = database.InsertCategory(db, category)
	}

	// Fetch posts by category ID
	posts, err := database.GetPostByCategoryID(db, categoryID)
	if err != nil {
		fmt.Println("❌ Error retrieving posts from category:", err)
		http.Error(w, "Failed to retrieve posts from category", http.StatusInternalServerError)
		return
	}

	if len(posts) < 1 {
		posts = []map[string]interface{}{}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	} else {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	}

}
