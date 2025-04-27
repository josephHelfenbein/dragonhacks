package startagent

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/pusher/pusher-http-go"
)

var pusherClient = pusher.Client{
	AppID:   os.Getenv("PUSHER_APP_ID"),
	Key:     os.Getenv("PUSHER_APP_KEY"),
	Secret:  os.Getenv("PUSHER_APP_SECRET"),
	Cluster: os.Getenv("PUSHER_APP_CLUSTER"),
	Secure:  true,
}

type Response struct {
	Status string `json:"status"`
	Error  string `json:"error,omitempty"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	err := pusherClient.Trigger("control", "start", nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{Status: "error", Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{Status: "ok"})
}
