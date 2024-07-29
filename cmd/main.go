package main

import (
	"fmt"
	"graphql/pkg"
	"log"
	"net/http"
)

func main() {
	http.Handle("/web/", http.StripPrefix("/web/", http.FileServer(http.Dir("web"))))
	http.HandleFunc("/", pkg.Render)

	fmt.Println("Opened server on : http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
