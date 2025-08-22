import React, { useState, useEffect } from "react"; // Importe useEffect
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // Obtém as funções de login, registro, e os estados de autenticação do contexto
  const { login, register, isAuthenticated, loading } = useAuth(); 

  // Efeito para redirecionar o usuário após autenticação bem-sucedida
  useEffect(() => {
    // Só redireciona se o carregamento da autenticação já terminou
    // E se o usuário está autenticado
    if (!loading && isAuthenticated) {
      navigate("/dashboard", { replace: true }); // Redireciona para o dashboard
    }
    // Este useEffect também serve para redirecionar se o usuário já estiver logado
    // e tentar acessar a página de login/registro diretamente.
  }, [isAuthenticated, loading, navigate]); // Dependências: re-executa quando esses valores mudam

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // A função login do AuthContext já lida com a chamada à API e a atualização de estado.
      await login(email, password); 
      // Não chame navigate aqui imediatamente.
      // O useEffect acima se encarregará do redirecionamento
      // uma vez que 'isAuthenticated' for atualizado no contexto.

    } catch (err) {
      handleError(err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // A função register do AuthContext já lida com a chamada à API e a atualização de estado.
      await register(name, email, password, "employee"); // 'employee' ou 'admin' ou 'user'

      alert("Registro bem-sucedido! Por favor, faça login.");
      setIsRegistering(false); // Volta para o formulário de login
      setName(""); 
      setEmail("");
      setPassword("");
    } catch (err) {
      handleError(err);
    }
  };

  const handleError = (error) => {
    if (error.response && error.response.data && error.response.data.error) {
      setError(error.response.data.error);
    } else if (error.message) {
      setError("Erro de rede. Por favor, tente novamente mais tarde. Detalhes: " + error.message);
    } else {
      setError("Erro desconhecido. Por favor, tente novamente.");
    }
  };

  // Se o contexto ainda estiver carregando (ex: verificando o token inicial),
  // você pode querer mostrar um feedback visual.
  // Embora para a página de Login/Register, o `useEffect` já lida com isso.
  // if (loading) {
  //   return <div>Carregando estado de autenticação...</div>;
  // }

  return (
    <div className="login-container">
      <div className="login-image-section">
        <div className="login-image-content">
          <h1>Bem-vindo ao Appointment CRM</h1>
          <p>
            Otimize a gestão de seus agendamentos com nossa solução CRM profissional. Organize, agende e gerencie os agendamentos de seus clientes de forma eficiente.
          </p>
        </div>
      </div>
      <div className="login-form-section">
        <div className="login-box">
          <h2 className="login-title">
            {isRegistering ? "Criar Conta" : "Bem-vindo de volta"}
          </h2>
          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            className="login-form"
          >
            {isRegistering && (
              <div className="input-group">
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Digite seu nome"
                />
              </div>
            )}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Digite seu email"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Digite sua senha"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button">
              {isRegistering ? "Criar Conta" : "Entrar"}
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="switch-button"
            >
              {isRegistering
                ? "Já tem uma conta? Faça login"
                : "Não tem uma conta? Cadastre-se"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;