import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Favorites } from "./pages/Favorites";
import { Home } from "./pages/Home";
import { Pantry } from "./pages/Pantry";
import { Quiz } from "./pages/Quiz";
import { RecipeDetail } from "./pages/RecipeDetail";
import { Results } from "./pages/Results";
import { Tip } from "./pages/Tip";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="pantry" element={<Pantry />} />
          <Route path="results" element={<Results />} />
          <Route path="recipe/:id" element={<RecipeDetail />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="tip" element={<Tip />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
