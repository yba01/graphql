package pkg

import (
	"html/template"
	"log"
	"net/http"
)

func Render(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("web/index.html")
	if err != nil {
		log.Fatal(err)
	}
	if err = t.Execute(w, nil); err != nil {
		log.Fatal(err)
	}
}