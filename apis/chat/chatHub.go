package chat

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	_ "modernc.org/sqlite"
)

type Message struct {
	From      int       `json:"from"`
	To        int       `json:"to"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
	Type      string    `json:"type"` // "message" or "typing"
}


type Client struct {
	UserID int
	Conn   *websocket.Conn
	Send   chan Message
}

type Hub struct {
	Clients      map[int]*Client
	Register     chan *Client
	Unregister   chan *Client
	Broadcast    chan Message
	MessageStore map[string][]Message // key: "user1-user2"
	Mutex        sync.RWMutex
	DB           *sql.DB
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func NewHub(db *sql.DB) *Hub {
	return &Hub{
		Clients:      make(map[int]*Client),
		Register:     make(chan *Client),
		Unregister:   make(chan *Client),
		Broadcast:    make(chan Message),
		MessageStore: make(map[string][]Message),
		DB:           db,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mutex.Lock()
			h.Clients[client.UserID] = client
			h.Mutex.Unlock()
		case client := <-h.Unregister:
			h.Mutex.Lock()
			delete(h.Clients, client.UserID)
			h.Mutex.Unlock()
		case msg := <-h.Broadcast:
			key := chatKey(msg.From, msg.To)
			h.Mutex.Lock()
			h.MessageStore[key] = append(h.MessageStore[key], msg)
			h.Mutex.Unlock()
			_ = h.saveMessageToDB(msg)
			if toClient, ok := h.Clients[msg.To]; ok {
				toClient.Send <- msg
			}
		}
	}
}

func (h *Hub) GetOnlineUserIDs() []int {
	h.Mutex.RLock()
	defer h.Mutex.RUnlock()

	var userIDs []int
	for id := range h.Clients {
		userIDs = append(userIDs, id)
	}
	return userIDs
}

func chatKey(a, b int) string {
	if a < b {
		return fmt.Sprintf("%d-%d", a, b)
	}
	return fmt.Sprintf("%d-%d", b, a)
}

func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	userIDStr := r.URL.Query().Get("user_id")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil || userID <= 0 {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("WebSocket Upgrade Error:", err)
		return
	}
	
	client := &Client{UserID: userID, Conn: conn, Send: make(chan Message)}
	hub.Register <- client

	go client.writePump()
	go client.readPump(hub)
}

func (c *Client) readPump(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, data, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var msg Message
		if err := json.Unmarshal(data, &msg); err != nil {
			continue
		}

		// Handle typing signal separately
		if msg.Type == "typing" {
			hub.Mutex.RLock()
			if toClient, ok := hub.Clients[msg.To]; ok {
				toClient.Send <- msg
			}
			hub.Mutex.RUnlock()
			continue
		}

		// Normal message: timestamp and broadcast
		msg.Timestamp = time.Now()
		hub.Broadcast <- msg
	}
}


func (c *Client) writePump() {
	for msg := range c.Send {
		data, _ := json.Marshal(msg)
		c.Conn.WriteMessage(websocket.TextMessage, data)
	}
}

func (h *Hub) saveMessageToDB(msg Message) error {
	query := `INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?)`
	_, err := h.DB.Exec(query, msg.From, msg.To, msg.Content, msg.Timestamp)
	return err
}
