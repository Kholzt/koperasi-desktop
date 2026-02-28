import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
// import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <AppWrapper>
                {/* <Toaster toastOptions={{
                    style: {
                        zIndex: 200000, // Or a sufficiently high value
                    },
                }}
                /> */}
                <ToastContainer />
                <App />
            </AppWrapper>
        </ThemeProvider>
    </StrictMode>,
);
