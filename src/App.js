import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AuthWrapper } from "./auth/AuthWrapper";
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap/dist/css/bootstrap.rtl.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./utils/ThemeContext";

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <BrowserRouter>
          {}
          <AuthWrapper />
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              className: "",
              duration: 5000,
              style: {
                background: "#f5f7fa",
                color: "#5a6a7e",
              },
            }}
          />
          {}
          {}
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
