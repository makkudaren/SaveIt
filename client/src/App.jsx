import { useState } from "react";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import LoginForm from "./components/LoginForm";

function Home() {
  return <h1>Home Page</h1>;
}

function About() {
  return <h1>About Page</h1>;
}

function App() {

  return(
    <>

      <LoginPage/>
    </>
  )


  /* 
  const [page, setPage] = useState("register"); // default page

  return (
    <div>
      {/* Navigation }
      <nav className="flex gap-4 mb-4">
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("about")}>About</button>
        <button onClick={() => setPage("register")}>Register</button>
        <button onClick={() => setPage("login")}>login</button>
      </nav>

      {/* Page content }
      <main>
        {page === "home" && <Home />}
        {page === "about" && <About />}
        {page === "register" && <RegisterForm />}
        {page === "login" && <LoginForm />}
      </main>
    </div>
  );*/
}

export default App;
