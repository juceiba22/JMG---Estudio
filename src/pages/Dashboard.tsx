import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, isMockFirebase } from '../lib/firebase';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

const COLORS = ['#344171', '#5468b3', '#8b9bd8', '#c4cceb', '#e6e8f0'];

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        if (isMockFirebase) {
          const localData = JSON.parse(localStorage.getItem('mockSurveys') || 'null');
          if (localData && localData.length > 0) {
            setData(localData);
            setErrorStatus("Modo Local: Firebase no configurado. Mostrando datos guardados en tu navegador.");
          } else {
            setData(mockData);
            setErrorStatus("Modo Local: Firebase no configurado. Mostrando datos de prueba estadísticos.");
          }
          await new Promise(r => setTimeout(r, 600));
        } else {
          const querySnapshot = await getDocs(collection(db, 'surveys'));
          const surveys: any[] = [];
          querySnapshot.forEach((doc) => {
            surveys.push(doc.data());
          });
          
          if (surveys.length > 0) {
            setData(surveys);
          } else {
            setData([]);
          }
        }
      } catch (err) {
        console.error("Firebase fetch error, using mock data for demonstration: ", err);
        setErrorStatus("Firebase no está configurado. Mostrando datos de prueba estadísticos.");
        setData(mockData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>Cargando estadísticas...</div>;
  }

  // --- Aggregate Data Processors ---
  
  // 1. Modalidad (Pie Chart)
  const modalidadCount: Record<string, number> = {};
  data.forEach((s) => {
    if (s.modalidad) {
      modalidadCount[s.modalidad] = (modalidadCount[s.modalidad] || 0) + 1;
    }
  });
  const modalidadChart = Object.keys(modalidadCount).map(key => ({
    name: key, value: modalidadCount[key]
  }));

  // 2. Satisfacción (Bar Chart)
  const satisfaccionCount: Record<string, number> = {};
  data.forEach((s) => {
    if (s.satisfaccion) {
      satisfaccionCount[s.satisfaccion] = (satisfaccionCount[s.satisfaccion] || 0) + 1;
    }
  });
  const satisfaccionChart = Object.keys(satisfaccionCount).map(key => ({
    name: key, cantidad: satisfaccionCount[key]
  }));

  // 3. Aspectos a mejorar (Bar Chart)
  const mejorasCount: Record<string, number> = {};
  data.forEach((s) => {
    if (s.mejoras && Array.isArray(s.mejoras)) {
      s.mejoras.forEach((m: string) => {
        mejorasCount[m] = (mejorasCount[m] || 0) + 1;
      });
    }
  });
  const mejorasChart = Object.keys(mejorasCount).map(key => ({
    name: key, menciones: mejorasCount[key]
  })).sort((a,b) => b.menciones - a.menciones);

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1200px' }}>
      <div className="dashboard-header">
        <div>
          <h1 style={{ marginBottom: '0' }}>Panel Estadístico</h1>
          <p>Análisis de resultados de encuestas</p>
        </div>
      </div>

      {errorStatus && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '2rem' }}>
          <strong>¡Aviso!</strong> {errorStatus}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{data.length}</div>
          <div className="stat-label">Total Encuestas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {data.filter(d => d.asesoramiento === 'Sí').length}
          </div>
          <div className="stat-label">Interesados en Asesoramiento</div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        
        {/* Gráfico 1: Modalidad */}
        <div className="card">
          <h3>Modalidad Utilizada</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modalidadChart} cx="50%" cy="50%" outerRadius={100} label fill="#8884d8" dataKey="value">
                  {modalidadChart.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Satisfacción */}
        <div className="card">
          <h3>Nivel de Satisfacción</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={satisfaccionChart} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="cantidad" fill="var(--primary)" barSize={40} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Aspectos a Mejorar */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3>Aspectos que desean mejorar</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mejorasChart} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="menciones" fill="#5468b3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tabla de leads */}
      <div className="card">
        <h3>Contactos Recientes</h3>
        <p style={{marginBottom: '1rem'}}>Lista de respuestas identificadas.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Empresa</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Contacto</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Datos dejados</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: '500' }}>{d.empresa}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{d.nombreContacto}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    {d.contactoOpcional || <span style={{color: '#9ca3af', fontStyle:'italic'}}>No dejó</span>}
                  </td>
                  <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Desconocida'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Mock Data
const mockData = [
  { empresa: 'TechNova', nombreContacto: 'María Silva', modalidad: 'Pago mensual fijo', satisfaccion: 'Conforme', mejoras: ['Tiempo de respuesta'], actividad: 'PyME', asesoramiento: 'Sí', contactoOpcional: 'maria@technova.com', createdAt: '2023-10-01T10:00:00Z' },
  { empresa: 'Estudio Alpha', nombreContacto: 'Carlos López', modalidad: 'Pago por trabajo puntual', satisfaccion: 'Poco conforme', mejoras: ['Uso de herramientas digitales', 'Atención personalizada'], actividad: 'Autónomo', asesoramiento: 'Sí', contactoOpcional: '1144556677', createdAt: '2023-10-02T11:00:00Z' },
  { empresa: 'Beta Solutions', nombreContacto: 'Ana Gómez', modalidad: 'Otro', satisfaccion: 'Nada conforme', mejoras: ['Claridad en la información', 'Asesoramiento'], actividad: 'Emprendimiento en etapa inicial', asesoramiento: 'No', contactoOpcional: '', createdAt: '2023-10-03T12:00:00Z' },
  { empresa: 'Zeta Corp', nombreContacto: 'Julio Díaz', modalidad: 'Pago mensual fijo', satisfaccion: 'Muy conforme', mejoras: [], actividad: 'PyME', asesoramiento: 'No', contactoOpcional: 'julio@zetacorp.com', createdAt: '2023-10-04T13:00:00Z' },
  { empresa: 'Freelancer X', nombreContacto: 'Sofía Ruiz', modalidad: 'Pago por trabajo puntual', satisfaccion: 'Conforme', mejoras: ['Atención personalizada'], actividad: 'Monotributista', asesoramiento: 'Sí', contactoOpcional: 'sofia.ruiz@gmail.com', createdAt: '2023-10-05T14:00:00Z' },
];
