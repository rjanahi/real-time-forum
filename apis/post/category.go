package post

import (
	"database/sql"
	"encoding/json"
	"fmt"
	database "forum/database"
	"net/http"
)

func GetPostbyCategory(db *sql.DB, w http.ResponseWriter, r *http.Request, category string) {
	var posts []map[string]interface{}
	// grab the category id from the category string
	postIDS, err := GetPostsID(db, w, r)
	if err != nil {
		fmt.Println("❌ Error retrieving post ID's:", err)
		http.Error(w, "Error retrieving post ID's", http.StatusInternalServerError)
		return
	}
	for i := 0; i < len(postIDS); i++ {
		// Fetch categories for this post
		categories, err := database.GetCategoriesByPostID(db, postIDS[i])
		if err != nil {
			fmt.Println("❌ Error retrieving categories for post:", err)
			http.Error(w, "Failed to retrieve categories", http.StatusInternalServerError)
			return
		}
		for j := 0; j < len(postIDS); j++ {
			if category == categories[j] {
				categoryPost, err := database.GetPostByCategoryID(db, category)
				if err != nil {
					fmt.Println("❌ Error retrieving post from category:", err)
					http.Error(w, "Failed to retrieve post from category", http.StatusInternalServerError)
					return
				}
				posts = categoryPost
			}
		}
	}

	//after that send all the posts to the interface.
	// Return posts as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
