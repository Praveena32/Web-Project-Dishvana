import http.server
import socketserver
import json
import os

PORT = 8000

class DishvanaRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # API endpoint for fetching menu data
        if self.path == '/api/menu':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                # Resolve path relative to script directory
                base_dir = os.path.dirname(os.path.abspath(__file__))
                menu_path = os.path.join(base_dir, 'menu.json')
                with open(menu_path, 'r', encoding='utf-8') as f:
                    menu_data = json.load(f)
                self.wfile.write(json.dumps(menu_data).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({"error": f"Could not read menu data: {str(e)}"}).encode('utf-8'))
        else:
            # Serve regular static files (HTML, CSS, JS, Images)
            super().do_GET()

if __name__ == '__main__':
    # Ensure working directory is the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Configure TCPServer to allow quick address reuse
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), DishvanaRequestHandler) as httpd:
        print("==============================================================")
        print(f" Dishvana Colombo - Modern Demo Server running at:")
        print(f" http://localhost:{PORT}/")
        print("==============================================================")
        print("Press Ctrl+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer shut down successfully.")
