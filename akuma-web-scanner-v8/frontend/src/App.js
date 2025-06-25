import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const GRAFANA_URL = process.env.REACT_APP_GRAFANA_URL || 'http://localhost:3000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedScan, setSelectedScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    telegram_chat_id: '',
    email: '',
    enable_telegram: false,
    enable_email: false,
    enable_critical_alerts: true
  });
  const [formData, setFormData] = useState({
    name: '',
    targets: '',
    scan_type: 'ultimate'
  });

  // Fetch data
  const fetchScans = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/scans`);
      const data = await response.json();
      setScans(data);
    } catch (error) {
      console.error('Ошибка загрузки сканов:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  useEffect(() => {
    fetchScans();
    fetchStats();
    const interval = setInterval(() => {
      fetchScans();
      fetchStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Create new scan
  const createScan = async (scanData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/scans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scanData),
      });
      
      if (response.ok) {
        await fetchScans();
        setActiveTab('scans');
        alert('✅ Скан успешно создан!');
      } else {
        alert('❌ Ошибка создания скана');
      }
    } catch (error) {
      console.error('Ошибка создания скана:', error);
      alert('❌ Ошибка создания скана');
    }
    setLoading(false);
  };

  // Delete scan
  const deleteScan = async (scanId) => {
    if (window.confirm('Вы уверены что хотите удалить этот скан?')) {
      try {
        const response = await fetch(`${API_BASE}/api/scans/${scanId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          await fetchScans();
          if (selectedScan && selectedScan.id === scanId) {
            setSelectedScan(null);
          }
          alert('✅ Скан удален успешно');
        } else {
          alert('❌ Ошибка удаления скана');
        }
      } catch (error) {
        console.error('Ошибка удаления скана:', error);
        alert('❌ Ошибка удаления скана');
      }
    }
  };

  // Update notification settings
  const updateNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/notifications/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications),
      });
      
      if (response.ok) {
        alert('✅ Настройки уведомлений обновлены успешно!');
      } else {
        alert('❌ Ошибка обновления настроек уведомлений');
      }
    } catch (error) {
      console.error('Ошибка обновления уведомлений:', error);
      alert('❌ Ошибка обновления настроек уведомлений');
    }
    setLoading(false);
  };

  // Test notifications
  const testNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/notifications/test`);
      const result = await response.json();
      
      alert(`🧪 Результаты тестирования:\n📱 Telegram: ${result.telegram}\n📧 Email: ${result.email}`);
    } catch (error) {
      console.error('Ошибка тестирования уведомлений:', error);
      alert('❌ Ошибка тестирования уведомлений');
    }
    setLoading(false);
  };

  const TabButton = ({ id, children, active, onClick }) => (
    <button
      className={`tab-button ${active ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      {children}
    </button>
  );

  const renderDashboard = () => (
    <div className="dashboard">
      <h1>🚀 AKUMA Web Scanner v6.5</h1>
      <div className="subtitle">Улучшенный Арсенал Безопасности с Уведомлениями</div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total_scans || 0}</div>
          <div className="stat-label">Всего Сканов</div>
        </div>
        <div className="stat-card running">
          <div className="stat-number">{stats.running_scans || 0}</div>
          <div className="stat-label">Активных Сканов</div>
        </div>
        <div className="stat-card completed">
          <div className="stat-number">{stats.completed_scans || 0}</div>
          <div className="stat-label">Завершенных Сканов</div>
        </div>
        <div className="stat-card vulnerabilities">
          <div className="stat-number">{stats.total_vulnerabilities || 0}</div>
          <div className="stat-label">Всего Уязвимостей</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-number">{stats.critical_vulnerabilities || 0}</div>
          <div className="stat-label">Критических Уязвимостей</div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-button primary" onClick={() => setActiveTab('new-scan')}>
          🎯 Новый Скан
        </button>
        <button className="action-button" onClick={() => setActiveTab('scans')}>
          📋 Управление Сканами
        </button>
        <button className="action-button" onClick={() => window.open(GRAFANA_URL, '_blank')}>
          📊 Открыть Grafana
        </button>
        <button className="action-button" onClick={() => setActiveTab('notifications')}>
          🔔 Уведомления
        </button>
      </div>
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const targets = formData.targets.split('\n').filter(t => t.trim());
    if (targets.length === 0) {
      alert('❌ Пожалуйста, добавьте хотя бы одну цель');
      return;
    }
    createScan({
      name: formData.name,
      targets: targets,
      scan_type: formData.scan_type,
      scan_options: {
        modules: ['nmap', 'nuclei', 'subdomain_enum', 'directory_fuzzing']
      }
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/api/scans/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({
          ...prev,
          targets: result.targets.join('\n')
        }));
        alert(`✅ Загружено ${result.count} целей из файла`);
      } else {
        alert('❌ Ошибка загрузки файла');
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert('❌ Ошибка загрузки файла');
    }
  };

  const renderNewScan = () => (
    <div className="new-scan">
      <h2>🎯 Создание Нового Скана</h2>
      <form onSubmit={handleSubmit} className="scan-form">
        <div className="form-group">
          <label>Название Скана:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Введите название скана"
            required
          />
        </div>

        <div className="form-group">
          <label>Тип Скана:</label>
          <select
            value={formData.scan_type}
            onChange={(e) => setFormData({...formData, scan_type: e.target.value})}
          >
            <option value="ultimate">🚀 Полный Скан</option>
            <option value="quick">⚡ Быстрый Скан</option>
            <option value="deep">🔍 Глубокий Скан</option>
          </select>
        </div>

        <div className="form-group">
          <label>Цели (одна на строку):</label>
          <textarea
            value={formData.targets}
            onChange={(e) => setFormData({...formData, targets: e.target.value})}
            placeholder="https://example.com&#10;192.168.1.1&#10;subdomain.example.com"
            rows="6"
            required
          />
        </div>

        <div className="form-group">
          <label>Загрузить файл с целями:</label>
          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileUpload}
          />
          <small>Поддерживаются файлы .txt и .csv</small>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? '🔄 Создание...' : '🚀 Запустить Скан'}
        </button>
      </form>
    </div>
  );

  const renderNotifications = () => (
    <div className="notifications">
      <h2>🔔 Настройки Уведомлений</h2>
      
      <div className="notification-form">
        <div className="form-section">
          <h3>📱 Telegram Уведомления</h3>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={notifications.enable_telegram}
                onChange={(e) => setNotifications({
                  ...notifications,
                  enable_telegram: e.target.checked
                })}
              />
              Включить Telegram уведомления
            </label>
          </div>
          <div className="form-group">
            <label>Telegram Chat ID:</label>
            <input
              type="text"
              value={notifications.telegram_chat_id}
              onChange={(e) => setNotifications({
                ...notifications,
                telegram_chat_id: e.target.value
              })}
              placeholder="Ваш Telegram Chat ID"
            />
            <small>
              💡 Чтобы получить Chat ID: <br/>
              1. Начните чат с @userinfobot в Telegram<br/>
              2. Отправьте любое сообщение для получения Chat ID
            </small>
          </div>
        </div>

        <div className="form-section">
          <h3>📧 Email Уведомления</h3>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={notifications.enable_email}
                onChange={(e) => setNotifications({
                  ...notifications,
                  enable_email: e.target.checked
                })}
              />
              Включить email уведомления
            </label>
          </div>
          <div className="form-group">
            <label>Email Адрес:</label>
            <input
              type="email"
              value={notifications.email}
              onChange={(e) => setNotifications({
                ...notifications,
                email: e.target.value
              })}
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>⚠️ Настройки Оповещений</h3>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={notifications.enable_critical_alerts}
                onChange={(e) => setNotifications({
                  ...notifications,
                  enable_critical_alerts: e.target.checked
                })}
              />
              Отправлять немедленные оповещения о критических уязвимостях
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="submit-button" 
            onClick={updateNotifications}
            disabled={loading}
          >
            {loading ? '🔄 Сохранение...' : '💾 Сохранить Настройки'}
          </button>
          <button 
            className="test-button" 
            onClick={testNotifications}
            disabled={loading}
          >
            {loading ? '🔄 Тестирование...' : '🧪 Тестировать Уведомления'}
          </button>
        </div>
      </div>

      <div className="notification-info">
        <h3>📋 Переменные Окружения</h3>
        <p>Для включения уведомлений настройте эти переменные окружения:</p>
        <div className="env-vars">
          <code>TELEGRAM_BOT_TOKEN=your_bot_token</code><br/>
          <code>SMTP_HOST=smtp.gmail.com</code><br/>
          <code>SMTP_PORT=587</code><br/>
          <code>SMTP_USER=your_email@gmail.com</code><br/>
          <code>SMTP_PASSWORD=your_app_password</code><br/>
        </div>
      </div>
    </div>
  );

  const renderScans = () => (
    <div className="scans">
      <h2>📋 Управление Сканами</h2>
      {scans.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'rgba(0,255,255,0.7)'}}>
          <h3>📭 Нет активных сканов</h3>
          <p>Создайте новый скан для начала работы</p>
        </div>
      ) : (
        <div className="scans-grid">
          {scans.map(scan => (
            <div key={scan.id} className={`scan-card status-${scan.status}`}>
              <div className="scan-header">
                <h3>{scan.name}</h3>
                <div className="scan-actions">
                  <button onClick={() => setSelectedScan(scan)} className="view-button">
                    👁️ Просмотр
                  </button>
                  <button onClick={() => deleteScan(scan.id)} className="delete-button">
                    🗑️ Удалить
                  </button>
                </div>
              </div>
              <div className="scan-info">
                <div>Статус: <span className={`status-badge ${scan.status}`}>
                  {scan.status === 'running' ? 'Выполняется' : 
                   scan.status === 'completed' ? 'Завершен' : 
                   scan.status === 'failed' ? 'Ошибка' : scan.status}
                </span></div>
                <div>Прогресс: {scan.progress}%</div>
                <div>Целей: {scan.targets.length}</div>
                <div>Уязвимостей: {scan.vulnerabilities.length}</div>
              </div>
              {scan.status === 'running' && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${scan.progress}%`}}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedScan && (
        <div className="scan-details-modal" onClick={() => setSelectedScan(null)}>
          <div className="scan-details" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔍 Детали Скана: {selectedScan.name}</h3>
              <button onClick={() => setSelectedScan(null)} className="close-button">✖️</button>
            </div>
            <div className="modal-content">
              <div className="scan-meta">
                <div><strong>ID:</strong> {selectedScan.id}</div>
                <div><strong>Статус:</strong> <span className={`status-badge ${selectedScan.status}`}>
                  {selectedScan.status === 'running' ? 'Выполняется' : 
                   selectedScan.status === 'completed' ? 'Завершен' : 
                   selectedScan.status === 'failed' ? 'Ошибка' : selectedScan.status}
                </span></div>
                <div><strong>Создан:</strong> {new Date(selectedScan.created_at).toLocaleString()}</div>
                <div><strong>Тип:</strong> {selectedScan.scan_type}</div>
                <div><strong>Прогресс:</strong> {selectedScan.progress}%</div>
              </div>

              <div className="targets-section">
                <h4>🎯 Цели ({selectedScan.targets.length})</h4>
                <div className="targets-list">
                  {selectedScan.targets.map((target, index) => (
                    <span key={index} className="target-tag">{target}</span>
                  ))}
                </div>
              </div>

              <div className="vulnerabilities-section">
                <h4>🚨 Уязвимости ({selectedScan.vulnerabilities.length})</h4>
                {selectedScan.vulnerabilities.length === 0 ? (
                  <p style={{color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '20px'}}>
                    Уязвимости не обнаружены или скан еще выполняется
                  </p>
                ) : (
                  <div className="vulnerabilities-list">
                    {selectedScan.vulnerabilities.map(vuln => (
                      <div key={vuln.id} className={`vulnerability-item severity-${vuln.severity}`}>
                        <div className="vuln-header">
                          <span className={`severity-badge ${vuln.severity}`}>
                            {vuln.severity === 'critical' ? 'КРИТИЧНАЯ' :
                             vuln.severity === 'high' ? 'ВЫСОКАЯ' :
                             vuln.severity === 'medium' ? 'СРЕДНЯЯ' :
                             vuln.severity === 'low' ? 'НИЗКАЯ' : vuln.severity.toUpperCase()}
                          </span>
                          <span className="vuln-title">{vuln.title}</span>
                          <span className="cvss-score">CVSS: {vuln.cvss}</span>
                        </div>
                        <div className="vuln-description">{vuln.description}</div>
                        <div className="vuln-tool">Обнаружено: {vuln.tool}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">💀</span>
          <span className="brand-text">AKUMA v6.5</span>
        </div>
        <div className="nav-tabs">
          <TabButton id="dashboard" active={activeTab === 'dashboard'} onClick={setActiveTab}>
            🏠 Панель
          </TabButton>
          <TabButton id="new-scan" active={activeTab === 'new-scan'} onClick={setActiveTab}>
            🎯 Новый Скан
          </TabButton>
          <TabButton id="scans" active={activeTab === 'scans'} onClick={setActiveTab}>
            📋 Сканы
          </TabButton>
          <TabButton id="notifications" active={activeTab === 'notifications'} onClick={setActiveTab}>
            🔔 Уведомления
          </TabButton>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'new-scan' && renderNewScan()}
        {activeTab === 'scans' && renderScans()}
        {activeTab === 'notifications' && renderNotifications()}
      </main>
    </div>
  );
}

export default App;
