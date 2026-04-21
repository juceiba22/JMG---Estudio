import { useState, type FormEvent } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Survey() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empresa: '',
    nombreContacto: '',
    tieneServicio: '',
    modalidad: '',
    costo: '',
    satisfaccion: '',
    mejoras: [] as string[],
    actividad: '',
    asesoramiento: '',
    contactoOpcional: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRadioChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => {
      const current = prev.mejoras;
      if (current.includes(value)) {
        return { ...prev, mejoras: current.filter(item => item !== value) };
      } else {
        return { ...prev, mejoras: [...current, value] };
      }
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Auto add timestamp
    const submitData = {
      ...formData,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'surveys'), submitData);
      setSubmitted(true);
    } catch (error) {
      console.error("Error al enviar la encuesta: ", error);
      alert("Hubo un incoveniente al guardar la encuesta. ¿Verificaste la configuración de Firebase?");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>¡Gracias por tus respuestas!</h2>
        <p style={{ fontSize: '1.2rem' }}>Tus datos han sido registrados de forma confidencial y nos ayudarán a mejorar.</p>
        <button className="btn btn-primary" style={{ marginTop: '2rem', width: 'auto' }} onClick={() => navigate('/dashboard')}>
          Ver Estadísticas (Admin)
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="app-header">
        <div className="logo-mock">JMG</div>
        <div className="logo-sub">Estudio Contable y Consultoría</div>
      </div>
      
      <div className="card">
        <h1 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '0.5rem' }}>📊 Encuesta sobre servicios contables</h1>
        <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Estamos realizando una breve encuesta para conocer mejor las necesidades de profesionales y emprendedores en materia contable.
          <br/>Tus respuestas son confidenciales y nos ayudarán a mejorar nuestros servicios. (Duración: menos de 1 minuto)
        </p>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Nombre de tu Empresa / Emprendimiento <span className="required">*</span></label>
            <input 
              required
              type="text" 
              className="form-input" 
              placeholder="Ej. Mi Proyecto SRL"
              value={formData.empresa}
              onChange={(e) => setFormData({...formData, empresa: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tu Nombre <span className="required">*</span></label>
            <input 
              required
              type="text" 
              className="form-input" 
              placeholder="Ej. Juan Pérez"
              value={formData.nombreContacto}
              onChange={(e) => setFormData({...formData, nombreContacto: e.target.value})}
            />
          </div>

          <hr style={{ border: 0, height: '1px', background: 'var(--border-color)', margin: '2rem 0' }} />

          <div className="form-group">
            <label className="form-label">1. ¿Actualmente contás con un servicio contable?</label>
            <div className="options-grid">
              {['Sí', 'No'].map(opt => (
                <label key={opt} className={`option-label ${formData.tieneServicio === opt ? 'selected' : ''}`}>
                  <input type="radio" required name="srv_contable" value={opt} onChange={() => handleRadioChange('tieneServicio', opt)} checked={formData.tieneServicio === opt} />
                  <div className="option-indicator"></div>
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.tieneServicio === 'Sí' && (
            <div className="form-group animate-fade-in">
              <label className="form-label">2. ¿Qué modalidad utilizás?</label>
              <div className="options-grid">
                {['Pago mensual fijo', 'Pago por trabajo puntual', 'Otro'].map(opt => (
                  <label key={opt} className={`option-label ${formData.modalidad === opt ? 'selected' : ''}`}>
                    <input type="radio" required name="modalidad" value={opt} onChange={() => handleRadioChange('modalidad', opt)} checked={formData.modalidad === opt} />
                    <div className="option-indicator"></div>
                    <span className="option-text">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">3. ¿Cómo percibís el costo de tu servicio contable actual?</label>
            <div className="options-grid">
              {['Bajo', 'Adecuado', 'Elevado'].map(opt => (
                <label key={opt} className={`option-label ${formData.costo === opt ? 'selected' : ''}`}>
                  <input type="radio" required name="costo" value={opt} onChange={() => handleRadioChange('costo', opt)} checked={formData.costo === opt} />
                  <div className="option-indicator"></div>
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">4. ¿Qué nivel de satisfacción tenés con tu servicio actual?</label>
            <div className="options-grid">
              {['Muy conforme', 'Conforme', 'Poco conforme', 'Nada conforme'].map(opt => (
                <label key={opt} className={`option-label ${formData.satisfaccion === opt ? 'selected' : ''}`}>
                  <input type="radio" required name="satisfaccion" value={opt} onChange={() => handleRadioChange('satisfaccion', opt)} checked={formData.satisfaccion === opt} />
                  <div className="option-indicator"></div>
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">5. ¿Qué aspectos te gustaría mejorar? (Permite múltiples)</label>
            <div className="options-grid">
              {['Tiempo de respuesta', 'Claridad en la información', 'Asesoramiento', 'Atención personalizada', 'Uso de herramientas digitales', 'Otro'].map(opt => (
                <label key={opt} className={`option-label ${formData.mejoras.includes(opt) ? 'selected' : ''}`}>
                  <input type="checkbox" value={opt} onChange={() => handleCheckboxChange(opt)} checked={formData.mejoras.includes(opt)} />
                  <div className="option-indicator"></div>
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">6. ¿Qué tipo de actividad desarrollás?</label>
            <div className="options-grid">
              {['Monotributista', 'Autónomo', 'PyME', 'Emprendimiento en etapa inicial'].map(opt => (
                <label key={opt} className={`option-label ${formData.actividad === opt ? 'selected' : ''}`}>
                  <input type="radio" required name="actividad" value={opt} onChange={() => handleRadioChange('actividad', opt)} checked={formData.actividad === opt} />
                  <div className="option-indicator"></div>
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">7. ¿Te interesaría recibir asesoramiento contable sin cargo?</label>
            <div className="options-grid">
              {['Sí', 'No'].map(opt => (
                <label key={opt} className={`option-label ${formData.asesoramiento === opt ? 'selected' : ''}`}>
                  <input type="radio" required name="asesoramiento" value={opt} onChange={() => handleRadioChange('asesoramiento', opt)} checked={formData.asesoramiento === opt} />
                  <div className="option-indicator"></div>
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ display: 'flex', flexDirection: 'column' }}>
              8. Si querés que te contactemos, dejanos tu email o WhatsApp (Opcional)
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ej. juan@gmail.com / +54 9 11..."
              value={formData.contactoOpcional}
              onChange={(e) => setFormData({...formData, contactoOpcional: e.target.value})}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando respuestas...' : 'Enviar Encuesta'}
          </button>
        </form>
      </div>

      <a 
        href="https://wa.me/5491173855955?text=Hola,%20les%20escribo%20desde%20el%20formulario%20de%20encuestas."
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacto por WhatsApp"
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
}
