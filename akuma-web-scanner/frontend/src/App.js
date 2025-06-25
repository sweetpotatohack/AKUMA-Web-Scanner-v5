import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);
  const [showScanForm, setShowScanForm] = useState(false);
  const [scanName, setScanName] = useState('');
  const [targets, setTargets] = useState('');
  const [isCreatingScan, setIsCreatingScan] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showVulnDetails, setShowVulnDetails] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanType, setScanType] = useState('full');
  const [dashboardStats, setDashboardStats] = useState({});

  useEffect(() => {
    loadData();
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get('/api/health');
      setMessage('🔥 AKUMA Scanner v2.0 Ready! 💀');
      
      const [scansResponse, statsResponse] = await Promise.all([
        axios.get('/api/scans'),
        axios.get('/api/dashboard/stats')
      ]);
      
      setScans(scansResponse.data || []);
      setDashboardStats(statsResponse.data || {});
    } catch (error) {
      setMessage('⚠️ Backend Connection Failed');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewScan = async () => {
    setShowScanForm(true);
  };

  const createScan = async () => {
    if (!scanName.trim() || (!targets.trim() && !selectedFile)) {
      setMessage('❌ Please fill scan name and targets or upload file');
      return;
    }

    setIsCreatingScan(true);
    try {
      let response;
      
      if (selectedFile) {
        // Upload file scan
        const formData = new FormData();
        formData.append('name', scanName);
        formData.append('scan_type', scanType);
        formData.append('file', selectedFile);
        
        response = await axios.post('/api/scans/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Manual targets scan
        const targetList = targets.split('\n').map(t => t.trim()).filter(t => t);
        
        response = await axios.post('/api/scans', {
          name: scanName,
          targets: targetList,
          scan_type: scanType
        });
      }
      
      setMessage(`✅ Scan "${scanName}" Started! ID: ${response.data.id}`);
      setScanName('');
      setTargets('');
      setSelectedFile(null);
      setShowScanForm(false);
      
      loadData();
    } catch (error) {
      setMessage('❌ Failed to start scan: ' + (error.response?.data?.detail || 'Unknown error'));
      console.error('Scan Error:', error);
    } finally {
      setIsCreatingScan(false);
    }
  };

  const viewVulnerabilities = async (scan) => {
    try {
      const response = await axios.get(`/api/scans/${scan.id}/vulnerabilities`);
      setVulnerabilities(response.data.vulnerabilities || []);
      setSelectedScan(scan);
      setShowVulnDetails(true);
    } catch (error) {
      setMessage('❌ Failed to load vulnerabilities');
      console.error('Vuln Error:', error);
    }
  };

  const openGrafana = async () => {
    try {
      const response = await axios.get('/api/grafana/url');
      window.open(response.data.grafana_url, '_blank');
    } catch (error) {
      window.open('http://localhost:3001', '_blank');
    }
  };

  const deleteScan = async (scanId) => {
    try {
      await axios.delete(`/api/scans/${scanId}`);
      setMessage(`🗑️ Scan ${scanId} deleted`);
      loadData();
    } catch (error) {
      setMessage('❌ Failed to delete scan');
      console.error('Delete Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffff00';
      case 'running': return '#00ddff';
      case 'completed': return '#00ff00';
      case 'failed': return '#ff0066';
      default: return '#666';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#ff0066';
      case 'High': return '#ff6600';
      case 'Medium': return '#ffff00';
      case 'Low': return '#00ff66';
      case 'Info': return '#00ddff';
      default: return '#666';
    }
  };

  const getProgressBar = (progress) => {
    return (
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '10px', 
        overflow: 'hidden',
        height: '20px',
        margin: '5px 0'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(45deg, #00ff00, #00ddff)',
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="cyberpunk-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '24px' 
      }}>
        <div className="neon-text glitch">
          🔄 INITIALIZING AKUMA SCANNER v2.0... 🔄
        </div>
      </div>
    );
  }

  if (showVulnDetails && selectedScan) {
    return (
      <div className="cyberpunk-container">
        <div style={{ padding: '20px' }}>
          <button 
            onClick={() => setShowVulnDetails(false)}
            style={{
              background: 'transparent',
              border: '1px solid #00ff00',
              color: '#00ff00',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Scans
          </button>
          
          <h1 className="neon-text" style={{ 
            fontSize: '36px', 
            marginBottom: '20px',
            color: '#00ddff' 
          }}>
            🔍 Vulnerability Details - {selectedScan.name}
          </h1>

          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '2px solid #00ff00',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ff0066', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'Critical').length}
                </div>
                <div style={{ color: '#666' }}>Critical</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ff6600', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'High').length}
                </div>
                <div style={{ color: '#666' }}>High</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ffff00', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'Medium').length}
                </div>
                <div style={{ color: '#666' }}>Medium</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#00ff66', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'Low').length}
                </div>
                <div style={{ color: '#666' }}>Low</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#00ddff', fontSize: '24px', fontWeight: 'bold' }}>
                  {vulnerabilities.filter(v => v.severity === 'Info').length}
                </div>
                <div style={{ color: '#666' }}>Info</div>
              </div>
            </div>
          </div>

          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {vulnerabilities.map((vuln, index) => (
              <div key={index} style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${getSeverityColor(vuln.severity)}`,
                padding: '20px',
                margin: '15px 0',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ color: '#00ddff', margin: 0 }}>{vuln.type}</h3>
                  <span style={{ 
                    color: getSeverityColor(vuln.severity),
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    {vuln.severity}
                  </span>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#00ff00', margin: '5px 0' }}>
                    <strong>Target:</strong> {vuln.target}
                  </p>
                  {vuln.port && (
                    <p style={{ color: '#00ff00', margin: '5px 0' }}>
                      <strong>Port/Service:</strong> {vuln.port}/{vuln.service}
                    </p>
                  )}
                  {vuln.cvss_score && (
                    <p style={{ color: '#ffff00', margin: '5px 0' }}>
                      <strong>CVSS Score:</strong> {vuln.cvss_score}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#ffffff', lineHeight: '1.6' }}>
                    <strong>Description:</strong><br />
                    {vuln.description}
                  </p>
                </div>

                {vuln.impact && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#ff6600', lineHeight: '1.6' }}>
                      <strong>Impact:</strong><br />
                      {vuln.impact}
                    </p>
                  </div>
                )}

                {vuln.solution && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#00ff66', lineHeight: '1.6' }}>
                      <strong>Solution:</strong><br />
                      {vuln.solution}
                    </p>
                  </div>
                )}

                {vuln.payload && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      <strong>Payload:</strong><br />
                      <code style={{ 
                        background: 'rgba(0,0,0,0.5)', 
                        padding: '5px', 
                        borderRadius: '3px',
                        display: 'block',
                        marginTop: '5px'
                      }}>
                        {vuln.payload}
                      </code>
                    </p>
                  </div>
                )}

                <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                  Detected: {new Date(vuln.detected_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyberpunk-container">
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 className="neon-text glitch" style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #ff006e, #00ff00, #8338ec)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🔥 AKUMA WEB SCANNER v2.0 💀
        </h1>
        
        <h2 className="neon-text" style={{ 
          fontSize: '24px', 
          marginBottom: '30px',
          color: '#00ddff' 
        }}>
          Enhanced Cyberpunk Vulnerability Scanner
        </h2>

        {/* Dashboard Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px',
          marginBottom: '30px',
          maxWidth: '1000px',
          margin: '0 auto 30px auto'
        }}>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #00ff00',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#00ddff', fontSize: '24px', fontWeight: 'bold' }}>
              {dashboardStats.total_scans || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Scans</div>
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #ff6600',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#ff6600', fontSize: '24px', fontWeight: 'bold' }}>
              {dashboardStats.total_vulnerabilities || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Vulnerabilities</div>
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #ffff00',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#ffff00', fontSize: '24px', fontWeight: 'bold' }}>
              {dashboardStats.total_targets || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Targets</div>
          </div>
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.7)', 
            border: '1px solid #ff0066',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ color: '#ff0066', fontSize: '24px', fontWeight: 'bold' }}>
              {dashboardStats.critical_vulnerabilities || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Critical</div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(0, 0, 0, 0.7)', 
          border: '2px solid #00ff00',
          borderRadius: '10px',
          padding: '30px',
          margin: '20px auto',
          maxWidth: '1200px',
          boxShadow: '0 0 30px rgba(0, 255, 0, 0.3)'
        }}>
          <p className="neon-text" style={{ fontSize: '20px', marginBottom: '20px' }}>
            {message}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <button 
              className="cyber-button" 
              onClick={startNewScan}
              style={{ 
                fontSize: '18px',
                padding: '15px 30px',
                margin: '10px'
              }}
            >
              🚀 START NEW SCAN 🚀
            </button>
            
            <button 
              className="cyber-button" 
              onClick={openGrafana}
              style={{ 
                fontSize: '18px',
                padding: '15px 30px',
                margin: '10px',
                background: 'linear-gradient(45deg, #8338ec, #ff006e)'
              }}
            >
              📊 OPEN GRAFANA 📊
            </button>
          </div>

          {showScanForm && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid #00ddff',
              borderRadius: '10px',
              padding: '20px',
              margin: '20px 0',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#00ddff', marginBottom: '15px' }}>
                🎯 Create New Enhanced Scan
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#00ff00', display: 'block', marginBottom: '5px' }}>
                  Scan Name:
                </label>
                <input
                  type="text"
                  value={scanName}
                  onChange={(e) => setScanName(e.target.value)}
                  placeholder="Enter scan name..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    borderRadius: '5px',
                    color: '#00ff00',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#00ff00', display: 'block', marginBottom: '5px' }}>
                  Scan Type:
                </label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    borderRadius: '5px',
                    color: '#00ff00',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="full">Full Scan (Nmap + Nuclei + CMS)</option>
                  <option value="wordpress">WordPress Focused</option>
                  <option value="bitrix">Bitrix CMS Focused</option>
                  <option value="quick">Quick Scan</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#00ff00', display: 'block', marginBottom: '5px' }}>
                  Upload Targets File (optional):
                </label>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    borderRadius: '5px',
                    color: '#00ff00',
                    fontFamily: 'inherit'
                  }}
                />
                {selectedFile && (
                  <div style={{ color: '#00ddff', fontSize: '14px', marginTop: '5px' }}>
                    ✅ File selected: {selectedFile.name}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ color: '#00ff00', display: 'block', marginBottom: '5px' }}>
                  Manual Targets (one per line):
                </label>
                <textarea
                  value={targets}
                  onChange={(e) => setTargets(e.target.value)}
                  placeholder="example.com
google.com
https://test.example.org
https://portal.keydisk.ru/"
                  rows={5}
                  disabled={!!selectedFile}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: selectedFile ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.7)',
                    border: '1px solid #00ff00',
                    borderRadius: '5px',
                    color: selectedFile ? '#666' : '#00ff00',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <button 
                  className="cyber-button" 
                  onClick={createScan}
                  disabled={isCreatingScan}
                  style={{ 
                    fontSize: '16px',
                    padding: '10px 20px',
                    margin: '5px',
                    opacity: isCreatingScan ? 0.6 : 1
                  }}
                >
                  {isCreatingScan ? '⏳ Creating...' : '⚡ START ENHANCED SCAN ⚡'}
                </button>
                
                <button 
                  onClick={() => {
                    setShowScanForm(false);
                    setSelectedFile(null);
                    setTargets('');
                    setScanName('');
                  }}
                  style={{ 
                    fontSize: '16px',
                    padding: '10px 20px',
                    margin: '5px',
                    background: 'transparent',
                    border: '1px solid #666',
                    color: '#666',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3 className="neon-text" style={{ color: '#ff6600', marginBottom: '15px' }}>
              📊 Recent Scans: {scans.length}
            </h3>
            
            {scans.length > 0 ? (
              <div style={{ textAlign: 'left' }}>
                {scans.slice(-10).reverse().map((scan, index) => (
                  <div key={scan.id} style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #00ff00',
                    padding: '15px',
                    margin: '10px 0',
                    borderRadius: '5px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#00ddff', fontWeight: 'bold' }}>
                          {scan.name} (#{scan.id})
                        </span>
                        <br />
                        <span style={{ color: '#ffff00', fontSize: '14px' }}>
                          Targets: {scan.targets.slice(0, 3).join(', ')}
                          {scan.targets.length > 3 && ` +${scan.targets.length - 3} more`}
                        </span>
                        <br />
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          Type: {scan.scan_type || 'full'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          color: getStatusColor(scan.status),
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {scan.status}
                        </span>
                        <br />
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          {scan.progress}%
                        </span>
                      </div>
                    </div>
                    
                    {scan.progress > 0 && getProgressBar(scan.progress)}
                    
                    {scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ color: '#ff6600' }}>
                          🚨 Vulnerabilities found: {scan.vulnerabilities.length}
                        </span>
                        <div style={{ marginTop: '5px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#ff0066', fontSize: '12px' }}>
                            Critical: {scan.vulnerabilities.filter(v => v.severity === 'Critical').length}
                          </span>
                          <span style={{ color: '#ff6600', fontSize: '12px' }}>
                            High: {scan.vulnerabilities.filter(v => v.severity === 'High').length}
                          </span>
                          <span style={{ color: '#ffff00', fontSize: '12px' }}>
                            Medium: {scan.vulnerabilities.filter(v => v.severity === 'Medium').length}
                          </span>
                          <span style={{ color: '#00ff66', fontSize: '12px' }}>
                            Low: {scan.vulnerabilities.filter(v => v.severity === 'Low').length}
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '10px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      {scan.status === 'completed' && scan.vulnerabilities && scan.vulnerabilities.length > 0 && (
                        <button 
                          onClick={() => viewVulnerabilities(scan)}
                          style={{
                            background: 'linear-gradient(45deg, #00ddff, #00ff00)',
                            border: 'none',
                            color: '#000',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          🔍 View Details
                        </button>
                      )}
                      
                      <button 
                        onClick={() => deleteScan(scan.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid #ff006e',
                          color: '#ff006e',
                          padding: '5px 10px',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No scans yet. Start your first legendary hack with enhanced features! 🔥
              </p>
            )}
          </div>

          <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
            <p>🔥 Powered by AKUMA & Феня - The Cyber Gods v2.0 💀</p>
            <p>Features: File Upload • Detailed Vulns • Grafana Integration • CMS Detection</p>
            <p>Status: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
