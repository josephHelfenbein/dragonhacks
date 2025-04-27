package webrtcandidate

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

type Candidate struct {
	Candidate     string `json:"candidate"`
	SDPMid        string `json:"sdpMid"`
	SDPMLineIndex int    `json:"sdpMLineIndex"`
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

	var cand Candidate
	if err := json.NewDecoder(r.Body).Decode(&cand); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	err := pusherClient.Trigger("webrtc-signaling", "candidate", cand)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{Status: "error", Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Response{Status: "ok"})
}
