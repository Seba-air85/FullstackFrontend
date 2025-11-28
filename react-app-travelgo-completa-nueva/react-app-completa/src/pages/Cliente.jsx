import { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // 👈 Importar para redirección
import { useAuth } from '../context/AuthContext'; // 👈 Importar el hook de Auth

const API_BASE_URL = 'http://localhost:8081/api/clientes'; 

function Cliente() { 
    const { login } = useAuth(); // 👈 Obtener la función login del contexto
    const navigate = useNavigate(); // 👈 Inicializar navigate

    const [isLogin, setIsLogin] = useState(true); 
    const [formData, setFormData] = useState({ name: '', email: '', password: '' }); 
    
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Manejadores de Estado ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleAuthMode = () => {
        setIsLogin(prev => !prev);
        setErrors([]);
        setSuccessMessage('');
        setFormData({ name: '', email: '', password: '' }); 
    };

    // --- Validación de Cliente ---

    const validate = () => {
        const errs = [];
        const { name, email, password } = formData;
        
        if (!isLogin && !name.trim()) {
             errs.push('El nombre es obligatorio para el registro');
        }
        
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
             errs.push('El correo es obligatorio y debe ser válido');
        }
        
        if (!password.trim() || password.length < 6) {
             errs.push('La contraseña es obligatoria y debe tener al menos 6 caracteres');
        }
        
        setErrors(errs);
        setSuccessMessage('');
        return errs.length === 0;
    };

    // --- Manejador de Envío (Conexión al Backend) ---

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setLoading(true);
        
        const endpoint = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/registro`;
        const actionName = isLogin ? 'Login' : 'Registro';

        const payload = isLogin 
            ? { email: formData.email, password: formData.password }
            : formData; 

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                
                if (isLogin) {
                    // *** 🔑 INICIO DE SESIÓN EXITOSO: USAR CONTEXTO Y REDIRIGIR ***
                    login(result); 
                    setSuccessMessage(`¡Inicio de sesión exitoso! Redirigiendo...`);
                    // Redirigir al usuario a una ruta protegida (ej: /inicio)
                    navigate('/home', { replace: true }); 
                } else {
                    // Registro exitoso
                    setSuccessMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
                    setIsLogin(true); // Cambiar a la vista de Login
                }
                setFormData({ name: '', email: '', password: '' });
                setErrors([]);
            } else {
                const errorText = await response.text();
                setErrors([errorText || `Error en el ${actionName}. Por favor, inténtalo de nuevo.`]);
                setSuccessMessage('');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            setErrors(['Error de conexión con el servidor.']);
            setSuccessMessage('');
        } finally {
            setLoading(false);
        }
    };

    // --- Renderizado ---

    return (
        <main>
            <Container style={{ maxWidth: '400px', marginTop: '10vh' }}>
                <Card className="p-4 shadow">
                    <h2 className="text-center mb-4">
                        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                    </h2>
                    
                    {errors.length > 0 && <Alert variant="danger">{errors.join('. ')}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Form onSubmit={onSubmit} noValidate>
                        {/* Campo Nombre (Solo visible en Registro) */}
                        {!isLogin && (
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required={!isLogin} 
                                    disabled={loading}
                                />
                            </Form.Group>
                        )}

                        {/* Campo Correo */}
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Correo</Form.Label>
                            <Form.Control 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                disabled={loading}
                            />
                        </Form.Group>
                        
                        {/* Campo Contraseña */}
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                disabled={loading}
                            />
                        </Form.Group>

                        <Button type="submit" className="w-100 mt-3" disabled={loading}>
                            {loading ? (isLogin ? 'Accediendo...' : 'Registrando...') : (isLogin ? 'Iniciar Sesión' : 'Registrar')}
                        </Button>
                    </Form>
                    
                    <hr />

                    {/* Botón para alternar entre Login y Registro */}
                    <p className="text-center mt-3">
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
                        <Button variant="link" onClick={toggleAuthMode} disabled={loading} className="p-0 ms-1">
                            {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
                        </Button>
                    </p>
                </Card>
            </Container>
        </main>
    );
}

export default Cliente;