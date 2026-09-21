import requests
import json

BASE_URL = "http://localhost:3000"

# Lista över frontend‑routes du vill testa
routes = [
    {
        "name": "Startpage",
        "path": "/",
        "method": "GET"
    },
    {
        "name": "Card page",
        "path": "/card",
        "method": "GET"
    },
    {
        "name": "Login page",
        "path": "/login",
        "method": "GET"
    },
    {
        "name": "Register page",
        "path": "/register",
        "method": "GET"
    }
]

def test_route(route):
    url = BASE_URL + route["path"]
    method = route["method"]

    print(f"\n--- Testing: {route['name']} ---")
    print(f"{method} {url}")

    try:
        if method == "GET":
            res = requests.get(url)
        else:
            print("Unsupported method for frontend")
            return

        print(f"Status: {res.status_code}")

        # Kontrollera om HTML laddas
        if "<!DOCTYPE html>" in res.text or "<html" in res.text:
            print("HTML loaded successfully")
        else:
            print("Warning: Response does not look like HTML")

        # Visa första 200 tecken
        print("\nPreview:")
        print(res.text[:200].replace("\n", " ") + " ...")

    except Exception as e:
        print("ERROR:", e)


if __name__ == "__main__":
    print("🚀 Startar frontend‑tester...\n")

    for route in routes:
        test_route(route)

    print("\n🎉 Klart! Alla frontend‑routes testade.")
